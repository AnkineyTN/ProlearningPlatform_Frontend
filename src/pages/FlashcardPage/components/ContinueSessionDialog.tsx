import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ContinueSessionDialogProps {
  open: boolean;
  onContinue: () => void;
  onReset: () => void;
  onOpenChange?: (open: boolean) => void;
}

export default function ContinueSessionDialog({
  open,
  onContinue,
  onReset,
  onOpenChange,
}: ContinueSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange ?? (() => {})}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có phiên học dở dang</DialogTitle>
        </DialogHeader>
        <p>Bạn muốn tiếp tục học hay bắt đầu lại từ đầu?</p>
        <DialogFooter>
          <Button variant='outline' onClick={onReset}>
            Bắt đầu lại
          </Button>
          <Button onClick={onContinue}>Tiếp tục học</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
