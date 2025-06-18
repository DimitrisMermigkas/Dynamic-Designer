import { styled } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";

const CheckBoxLabel = styled(FormControlLabel)`
  color: ${(props) => props.theme.palette.text.primary};
  text-transform: capitalize;
`;

export default CheckBoxLabel;
