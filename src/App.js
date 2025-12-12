import { useState } from "react";
import { ChakraProvider, Container, Text, Box, Fade } from "@chakra-ui/react";
import Fish from "./components/fish";
import Icons from "./components/icons";
import { TITLE, SUBTITLE } from "./constants";

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
            <Text fontSize={{ base: "3xl", md: "5xl" }}>{TITLE}</Text>
            <Text fontSize={{ base: "xl", md: "3xl" }}>{SUBTITLE}</Text>
            <Icons />
          </Box>
        </Container>
        <Fish />
      </Fade>
    </ChakraProvider>
  );
}

export default App;
