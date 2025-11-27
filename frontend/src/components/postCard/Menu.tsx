"use client";

import { useId, useState } from "react";
import { PencilIcon, TrashIcon, CircleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


type MenuBarEditDeleteProps = {
  handleOpenEdit:()=>void
  children: React.ReactNode;
  projectName: string;
  onConfirmDelete?: () => void | Promise<void>;
};

export default function MenuBarEditDelete({
  handleOpenEdit,
  children,
  projectName ,
  onConfirmDelete,
}: MenuBarEditDeleteProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setInputValue("");
      setIsDeleting(false);
    }
  };

  const handleDelete = async () => {
    if (inputValue !== projectName || isDeleting) return;

    try {
      setIsDeleting(true);
      await onConfirmDelete?.(); // call parent delete logic if provided
      setOpen(false); // close dialog
    } catch (err) {
      console.error("Delete error:", err);
      // you can add toast here if you use one
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
  <Menu>
    <MenuTrigger render={
      <Button variant="ghost" className="rounded-full shadow-sm">{children}</Button>
    }/>
    <MenuPopup className="shadow-lg rounded-xl py-1 px-2">
      <MenuItem onClick={()=>handleOpenEdit()}>
        <PencilIcon className="opacity-70 mr-2" />
        Edit
      </MenuItem>
      <MenuSeparator />
      <DialogTrigger asChild>
        <MenuItem variant="destructive" className="text-red-600 font-semibold hover:bg-red-50">
          <TrashIcon className="opacity-70 mr-2" />
          Delete
        </MenuItem>
      </DialogTrigger>
    </MenuPopup>
  </Menu>

  <DialogContent className="rounded-xl shadow-xl border bg-background px-6 py-8 max-w-md transition-all">
    <div className="flex flex-col items-center gap-3">
      <div aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-yellow-50 border border-yellow-200 mb-2">
        <CircleAlertIcon className="text-yellow-700 opacity-80" size={24} />
      </div>
      <DialogHeader>
        <DialogTitle className="text-center text-lg font-bold">
          Final confirmation
        </DialogTitle>
        <DialogDescription className="text-center text-muted-foreground">
          This action cannot be undone. To confirm, please enter the project
          name <span className="text-primary font-semibold">{projectName}</span>.
        </DialogDescription>
      </DialogHeader>
    </div>

    <form className="space-y-6">
      <div>
        <Label htmlFor={id}>Project name</Label>
        <Input
          id={id}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Type ${projectName} to confirm`}
          type="text"
          value={inputValue}
          className="mt-2"
        />
      </div>
      <DialogFooter className="flex flex-row gap-2 pt-3">
        <DialogClose asChild>
          <Button className="flex-1" type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button
          className="flex-1"
          type="button"
          variant="destructive"
          disabled={inputValue !== projectName || isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

  );
}
