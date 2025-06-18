import { useDispatch, useSelector } from "react-redux";
import { fabricPageActions } from "../../FabricPageRedAct";
import { Design } from "../../../../schemas/schemaDesigner";
import { v4 as uuidv4 } from "uuid";
import { mockInitialDesign } from "../../mockInitialDesign";

interface IDesignsDialogHandlersProps {
  setSelectedDesign: (design: Design) => void;
  setScreenIndex: (index: number) => void;
}

export const useDesignsDialogHandlers = ({
  setSelectedDesign,
  setScreenIndex,
}: IDesignsDialogHandlersProps) => {
  const dispatch = useDispatch();
  const designs = useSelector((state: any) => state.fabricPageReducer.designs);

  const onCreateDesign = () => {
    const newDesign = {
      ...mockInitialDesign,
      ID: uuidv4(),
      Name: "New Design Demo",
    };
    dispatch(fabricPageActions.setDesigns([...designs, newDesign]));
  };

  const onUpdateDesign = (design) => {
    const updatedDesigns = designs.map((d) =>
      d.ID === design.ID ? { ...d, ...design } : d
    );
    dispatch(fabricPageActions.setDesigns(updatedDesigns));
    setSelectedDesign(design);
  };

  const onDeleteDesign = (designId) => {
    const updatedDesigns = designs.filter((d) => d.ID !== designId);
    dispatch(fabricPageActions.setDesigns(updatedDesigns));

    // Find the index of the deleted design
    const deletedIndex = designs.findIndex((d) => d.ID === designId);
    // Select the previous design if available, otherwise select the first one
    const nextDesign =
      deletedIndex > 0 ? designs[deletedIndex - 1] : updatedDesigns[0];
    setSelectedDesign(nextDesign);
  };

  const onCopyDesign = (design) => {
    const copiedDesign = {
      ...design,
      ID: uuidv4(),
      Name: `${design.Name} (Copy)`,
    };
    dispatch(fabricPageActions.setDesigns([...designs, copiedDesign]));
  };

  const onClickDesign = (design) => {
    setScreenIndex(0);
    setSelectedDesign(design);
  };

  return {
    onCreateDesign,
    onUpdateDesign,
    onDeleteDesign,
    onCopyDesign,
    onClickDesign,
  };
};
