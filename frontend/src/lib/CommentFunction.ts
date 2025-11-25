export const handleCommentClick = ({e}: {e: React.MouseEvent<HTMLButtonElement>}) => {
    e.stopPropagation()
    console.log("Comment button clicked")
  }