import React, { useState } from "react";
import { ChakraProvider, Container, Text, Box, Fade } from "@chakra-ui/react";
import Icons from "./components/icons";
import Fish from "./components/fish";

function App() {
  const [onload] = useState(true);

  return (
    <ChakraProvider>
      <Fade in={onload}>
        <Container
          fontFamily="Poppins"
          mx={{ base: 2, md: 10 }}
          my={{ base: 4, md: 10 }}
        >
          <Box>
            <Text fontSize={{ base: "3xl", md: "5xl" }}>benjamin duong</Text>
            <Text fontSize={{ base: "xl", md: "3xl" }}>
              computer science @ brown university
            </Text>
            <Icons />
          </Box>
        </Container>
        <Container mx={{ base: 2, md: 10 }} my={{ base: 4, md: 10 }}>
          <Text>Please watch my fish:</Text>
          <Text>---</Text>
        </Container>
        <Fish />
      </Fade>
    </ChakraProvider>
  );
}

export default App;
