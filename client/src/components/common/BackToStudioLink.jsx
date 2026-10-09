import { Link } from "react-router";

import { TextButton } from "@/components/ui/Button";

const BackToStudioLink = () => <TextButton as={Link} to="/studio" tone="accent">Go to your studio</TextButton>;

export default BackToStudioLink;
