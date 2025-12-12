import { HStack, Box } from "@chakra-ui/react";
import { SocialIcon } from "react-social-icons";

const data = [
  {
    url: "https://www.linkedin.com/in/benhduong/",
  },
  {
    url: "https://github.com/benhduong",
  },
  {
    url: "https://www.amazon.com/b?node=119684904011&pd_rd_w=bncfM&content-id=amzn1.sym.7c6c062a-98cb-45fe-ad03-b8a8a5680ae0:amzn1.sym.7c6c062a-98cb-45fe-ad03-b8a8a5680ae0&pf_rd_p=7c6c062a-98cb-45fe-ad03-b8a8a5680ae0&pf_rd_r=Q115ESQAW3JB30VD4H0G&pd_rd_wg=Rcmi8&pd_rd_r=1121b42d-e2d7-4954-9b85-80aa80f032ca&qid=1765528475&ref_=sxts_snpl_1_0_7c6c062a-98cb-45fe-ad03-b8a8a5680ae0",
  },
];

function Icons() {
  return (
    <HStack pt={5}>
      {data.map((data) => (
        <Box
          borderRadius={50}
          _hover={{ "box-shadow": "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
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
