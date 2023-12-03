import { HStack } from "@chakra-ui/react";
import { SocialIcon } from "react-social-icons";

import { Box } from "@chakra-ui/react";

const data = [
  {
    url: "https://www.linkedin.com/in/benhduong/",
  },
  {
    url: "https://github.com/benhduong",
  },
  {
    url: "mailto:benhduong@gmail.com",
  },
];

function Icons() {
  return (
    <HStack pt={3} pb={7}>
      {data.map((data) => (
        <Box
          borderRadius={50}
          _hover={{ "box-shadow": "0px 8px 8px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <SocialIcon
            target="_blank"
            url={data.url}
            bgColor="#D9D9D9"
            fgColor="#ffffff"
          />
        </Box>
      ))}
    </HStack>
  );
}

export default Icons;
