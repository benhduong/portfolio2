import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";

class FlockParams {
  constructor() {
    this.maxForce = 0.08;
    this.maxSpeed = 3.5;
    this.perceptionRadius = 130;
    this.alignAmp = 1;
    this.cohesionAmp = 1;
    this.separationAmp = 1;
  }
}

const Fish = () => {
  const [koiColor, setKoiColor] = useState("");

  const sketch = (p) => {
    let flockParams;
    const flock = [];
    const ripples = [];

    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight * 0.55);

      // Initialize flockParams and flock array
      flockParams = new FlockParams();
      const centerX = p.random(p.width - 200, 200);
      const centerY = p.random(p.height - 200, 200);
      const koiColors = ["#E02D28", "#FFB990", "#0093B2"];
      const color = p.random(koiColors);
      setKoiColor(color);
      const koiNumber = 9;
      new Array(koiNumber)
        .fill(1)
        .map(() => flock.push(new Koi(centerX, centerY, color)));
    };

    p.draw = () => {
      p.background(230);

      // Shadow
      flock.forEach((koi) => {
        koi.showShadow();
      });

      flock.forEach((koi) => {
        koi.edges();
        koi.flock(flock);
        koi.update();
        koi.show();
      });

      if (p.frameCount % 50 === 0) {
        ripples.push(new Ripple(p.random(p.width), p.random(p.height)));
      }

      ripples.forEach((r, i) => {
        r.update();
        r.show();
        if (r.lifespan < 0) ripples.splice(i, 1);
      });
    };

    p.mouseClicked = () => {
      ripples.push(new Ripple(p.mouseX, p.mouseY));
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight * 0.55);
    };

    const shadowColor = "rgba(0,0,0,0.05)";

    class Koi {
      constructor(x, y, koiColor) {
        this.color = p.color(koiColor);
        this.offsetX = p.random(-100, 100);
        this.offsetY = p.random(-100, 100);
        this.position = p.createVector(x + this.offsetX, y + this.offsetY);
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(p.random(2, 10));
        this.acceleration = p.createVector();
        this.maxForce = flockParams.maxForce;
        this.maxSpeed = flockParams.maxSpeed;
        this.baseSize = p.int(p.random(15, 20));
        this.bodyLength = this.baseSize * 2;
        this.body = new Array(this.bodyLength).fill({ ...this.position });
      }

      calculateDesiredSteeringForce(kois, factorType) {
        let steering = p.createVector();
        let total = 0;
        for (let other of kois) {
          let d = p.dist(
            this.position.x,
            this.position.y,
            other.position.x,
            other.position.y
          );
          if (d < flockParams.perceptionRadius && other !== this) {
            switch (factorType) {
              case "align":
                steering.add(other.velocity);
                break;
              case "cohesion":
                steering.add(other.position);
                break;
              case "separation":
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(d);
                steering.add(diff);
                break;
              default:
                break;
            }
            total++;
          }
        }

        if (total > 0) {
          steering.div(total);
          if (factorType === "cohesion") steering.sub(this.position);
          steering.setMag(flockParams.maxSpeed);
          steering.sub(this.velocity);
          steering.limit(flockParams.maxForce);
        }
        return steering;
      }

      align = (kois) => this.calculateDesiredSteeringForce(kois, "align");

      cohesion = (kois) => this.calculateDesiredSteeringForce(kois, "cohesion");

      separation = (kois) =>
        this.calculateDesiredSteeringForce(kois, "separation");

      avoid(obstacle) {
        let steering = p.createVector();
        let d = p.dist(
          this.position.x,
          this.position.y,
          obstacle.x,
          obstacle.y
        );
        if (d < flockParams.perceptionRadius) {
          let diff = p5.Vector.sub(this.position, obstacle);
          diff.div(d);
          steering.add(diff);
          steering.setMag(flockParams.maxSpeed);
          steering.sub(this.velocity);
          steering.limit(flockParams.maxForce);
        }
        return steering;
      }

      edges() {
        if (this.position.x > p.width + 50) {
          this.position.x = -50;
        } else if (this.position.x < -50) {
          this.position.x = p.width + 50;
        }
        if (this.position.y > p.height + 50) {
          this.position.y = -50;
        } else if (this.position.y < -50) {
          this.position.y = p.height + 50;
        }
      }

      flock(kois) {
        this.acceleration.mult(0);
        let alignment = this.align(kois);
        let cohesion = this.cohesion(kois);
        let separation = this.separation(kois);

        let mouseObstacle = p.createVector(p.mouseX, p.mouseY);
        let avoid = this.avoid(mouseObstacle);

        alignment.mult(flockParams.alignAmp);
        cohesion.mult(flockParams.cohesionAmp);
        separation.mult(flockParams.separationAmp);

        this.acceleration.add(avoid);
        this.acceleration.add(separation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);

        this.acceleration.add(p5.Vector.random2D().mult(0.05));
      }

      updateBody() {
        this.body.unshift({ ...this.position });
        this.body.pop();
      }

      show() {
        p.noStroke();
        this.body.forEach((b, index) => {
          let size;
          if (index < this.bodyLength / 6) {
            size = this.baseSize + index * 1.8;
          } else {
            size = this.baseSize * 2 - index;
          }
          this.color.setAlpha(this.bodyLength - index);
          p.fill(this.color);
          p.ellipse(b.x, b.y, size, size);
        });
      }

      showShadow() {
        p.noStroke();
        this.body.forEach((b, index) => {
          let size;
          if (index < this.bodyLength / 6) {
            size = this.baseSize + index * 1.8;
          } else {
            size = this.baseSize * 1.8 - index;
          }

          p.fill(200, 200, 200, 20);
          p.ellipse(b.x + 50, b.y + 50, size, size);
        });
      }

      update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(flockParams.maxSpeed);
        this.updateBody();
      }
    }

    class Ripple {
      constructor(x, y) {
        this.position = p.createVector(x, y);
        this.size = p.random(50, 100);
        this.lifespan = 255;
        this.color = p.color(255, 255, 255);
        this.sizeStep = p.random(2, 3);
        this.lifeStep = p.random(2, 10);
      }

      drawShape(x, y, offset, size, color) {
        p.stroke(color);
        p.strokeWeight(1);
        p.noFill();
        p.circle(x + offset, y + offset, size);
      }

      show() {
        this.color.setAlpha(this.lifespan);

        this.drawShape(
          this.position.x,
          this.position.y,
          0,
          this.size,
          this.color
        );
        this.drawShape(
          this.position.x,
          this.position.y,
          50,
          this.size,
          p.color(shadowColor)
        );
      }

      update() {
        this.size += this.sizeStep;
        this.lifespan -= this.lifeStep;
      }
    }
  };

  useEffect(() => {
    const updateFavicon = () => {
      const faviconLink = document.getElementById("favicon");
      const faviconColor = encodeURIComponent(koiColor);

      if (faviconLink) {
        faviconLink.href = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='64' width='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='${faviconColor}'/%3E%3C/svg%3E`;
      }
    };

    updateFavicon();
  }, [koiColor]);

  const sketchRef = useRef(null);

  useEffect(() => {
    sketchRef.current = new p5(sketch);
    return () => {
      sketchRef.current.remove();
    };
  }, []);

  return <div id="sketch-container"></div>;
};

export default Fish;
