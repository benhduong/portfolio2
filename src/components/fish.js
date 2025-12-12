import { useEffect, useRef } from "react";
import p5 from "p5";
import {
  KOI_COLORS,
  KOI_COUNT,
  SHADOW_COLOR,
  BACKGROUND_COLOR,
  CANVAS_HEIGHT_RATIO,
  FlockParams,
} from "../constants";

const Fish = () => {
  const koiColorRef = useRef("");
  const sketchRef = useRef(null);

  const sketch = (p) => {
    let flockParams;
    let flock = [];
    let ripples = [];

    p.setup = () => {
      p.createCanvas(
        window.innerWidth,
        window.innerHeight * CANVAS_HEIGHT_RATIO
      );

      flockParams = new FlockParams();
      const centerX = p.random(p.width - 200, 200);
      const centerY = p.random(p.height - 200, 200);
      const color = p.random(KOI_COLORS);
      koiColorRef.current = color;
      updateFavicon(color);

      for (let i = 0; i < KOI_COUNT; i++) {
        flock.push(new Koi(centerX, centerY, color));
      }
    };

    p.draw = () => {
      p.background(BACKGROUND_COLOR);

      for (const koi of flock) {
        koi.showShadow();
        koi.edges();
        koi.flock(flock);
        koi.update();
        koi.show();
      }

      if (p.frameCount % 50 === 0) {
        ripples.push(new Ripple(p.random(p.width), p.random(p.height)));
      }

      ripples = ripples.filter((r) => {
        r.update();
        r.show();
        return r.lifespan >= 0;
      });
    };

    p.mouseClicked = () => {
      ripples.push(new Ripple(p.mouseX, p.mouseY));
    };

    p.windowResized = () => {
      p.resizeCanvas(
        window.innerWidth,
        window.innerHeight * CANVAS_HEIGHT_RATIO
      );
    };

    class Koi {
      constructor(x, y, koiColor) {
        this.color = p.color(koiColor);
        this.position = p.createVector(
          x + p.random(-100, 100),
          y + p.random(-100, 100)
        );
        this.velocity = p5.Vector.random2D().setMag(p.random(2, 10));
        this.acceleration = p.createVector();
        this.maxForce = flockParams.maxForce;
        this.maxSpeed = flockParams.maxSpeed;
        this.baseSize = p.int(p.random(15, 20));
        this.bodyLength = this.baseSize * 2;
        this.body = new Array(this.bodyLength).fill(
          p.createVector(this.position.x, this.position.y)
        );
      }

      calculateDesiredSteeringForce(kois, type) {
        let steering = p.createVector();
        let total = 0;
        for (const other of kois) {
          if (other === this) continue;
          let dx = this.position.x - other.position.x;
          let dy = this.position.y - other.position.y;
          let dSq = dx * dx + dy * dy;

          if (
            dSq <
            flockParams.perceptionRadius * flockParams.perceptionRadius
          ) {
            if (type === "align") steering.add(other.velocity);
            else if (type === "cohesion") steering.add(other.position);
            else if (type === "separation") {
              let diff = p5.Vector.sub(this.position, other.position);
              diff.div(Math.sqrt(dSq));
              steering.add(diff);
            }
            total++;
          }
        }

        if (total > 0) {
          steering.div(total);
          if (type === "cohesion") steering.sub(this.position);
          steering.setMag(this.maxSpeed);
          steering.sub(this.velocity);
          steering.limit(this.maxForce);
        }
        return steering;
      }

      align(kois) {
        return this.calculateDesiredSteeringForce(kois, "align");
      }

      cohesion(kois) {
        return this.calculateDesiredSteeringForce(kois, "cohesion");
      }

      separation(kois) {
        return this.calculateDesiredSteeringForce(kois, "separation");
      }

      avoid(obstacle) {
        let d = p.dist(
          this.position.x,
          this.position.y,
          obstacle.x,
          obstacle.y
        );
        if (d < flockParams.perceptionRadius) {
          let diff = p5.Vector.sub(this.position, obstacle);
          diff.div(d);
          diff.setMag(this.maxSpeed);
          diff.sub(this.velocity);
          diff.limit(this.maxForce);
          return diff;
        }
        return p.createVector(0, 0);
      }

      edges() {
        if (this.position.x > p.width + 50) this.position.x = -50;
        else if (this.position.x < -50) this.position.x = p.width + 50;
        if (this.position.y > p.height + 50) this.position.y = -50;
        else if (this.position.y < -50) this.position.y = p.height + 50;
      }

      flock(kois) {
        this.acceleration.mult(0);
        const mouseVec = p.createVector(p.mouseX, p.mouseY);

        const align = this.align(kois).mult(flockParams.alignAmp);
        const cohesion = this.cohesion(kois).mult(flockParams.cohesionAmp);
        const separation = this.separation(kois).mult(
          flockParams.separationAmp
        );
        const avoid = this.avoid(mouseVec);

        this.acceleration.add(align);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
        this.acceleration.add(avoid);

        if (p.frameCount % 5 === 0) {
          this.acceleration.add(p5.Vector.random2D().mult(0.05));
        }
      }

      update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.body.pop();
        this.body.unshift(this.position.copy());
      }

      show() {
        p.noStroke();
        for (let i = 0; i < this.body.length; i++) {
          const b = this.body[i];
          const alpha = this.body.length - i;
          if (alpha < 5) continue;
          let size =
            i < this.bodyLength / 6
              ? this.baseSize + i * 1.8
              : this.baseSize * 2 - i;
          this.color.setAlpha(alpha);
          p.fill(this.color);
          p.ellipse(b.x, b.y, size, size);
        }
      }

      showShadow() {
        p.noStroke();
        for (let i = 0; i < this.body.length; i++) {
          const b = this.body[i];
          if (this.body.length - i < 5) continue;
          let size =
            i < this.bodyLength / 6
              ? this.baseSize + i * 1.8
              : this.baseSize * 1.8 - i;
          p.fill(200, 200, 200, 20);
          p.ellipse(b.x + 50, b.y + 50, size, size);
        }
      }
    }

    class Ripple {
      constructor(x, y) {
        this.position = p.createVector(x, y);
        this.size = p.random(50, 100);
        this.lifespan = 255;
        this.color = p.color(255);
        this.sizeStep = p.random(2, 3);
        this.lifeStep = p.random(2, 10);
      }

      show() {
        this.color.setAlpha(this.lifespan);
        p.stroke(this.color);
        p.strokeWeight(1);
        p.noFill();
        p.circle(this.position.x, this.position.y, this.size);
        p.stroke(SHADOW_COLOR);
        p.circle(this.position.x + 50, this.position.y + 50, this.size);
      }

      update() {
        this.size += this.sizeStep;
        this.lifespan -= this.lifeStep;
      }
    }

    const updateFavicon = (color) => {
      const faviconLink = document.getElementById("favicon");
      const faviconColor = encodeURIComponent(color);
      if (faviconLink) {
        faviconLink.href = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='64' width='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='${faviconColor}'/%3E%3C/svg%3E`;
      }
    };
  };

  useEffect(() => {
    sketchRef.current = new p5(
      sketch,
      document.getElementById("sketch-container")
    );
    return () => {
      if (sketchRef.current) sketchRef.current.remove();
    };
  }, []);

  return <div id="sketch-container" />;
};

export default Fish;
