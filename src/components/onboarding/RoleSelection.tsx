import { Check, Book, Layers } from "lucide-react";
import SwitchButton from "./SwitchButton";
import { useTranslation } from "react-i18next";

type Props = {
  selectedRole: string;
  onRoleSelect: (role: string) => void;
  onNext: () => void;
  onBack: () => void;
};

const RoleSelection = ({
  selectedRole,
  onRoleSelect,
  onNext,
  onBack,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='w-full max-w-2xl'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-foreground mb-3'>
            {t("onboarding.roleSelection.header")}
          </h1>
          <p className='text-muted-foreground'>
            {t("onboarding.roleSelection.description")}
          </p>
        </div>

        <div className='space-y-4 mb-8'>
          <button
            onClick={() => onRoleSelect("student")}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === "student"
                ? "border-blue-500 bg-card-selected"
                : "border-ring bg-card-secondary hover:border-gray-300"
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                  <Book className='w-6 h-6 text-blue-600' />
                </div>
                <div className='text-left'>
                  <div className='font-semibold text-foreground text-lg'>
                    {t("onboarding.roleSelection.student")}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {t("onboarding.roleSelection.studentDescription")}
                  </div>
                </div>
              </div>
              {selectedRole === "student" && (
                <div className='w-6 h-6 bg-foreground rounded-full flex items-center justify-center'>
                  <Check className='w-4 h-4 text-background' />
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => onRoleSelect("teacher")}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === "teacher"
                ? "border-blue-500 bg-card-selected"
                : "border-ring bg-card-secondary hover:border-gray-300"
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                  <Layers className='w-6 h-6 text-green-600' />
                </div>
                <div className='text-left'>
                  <div className='font-semibold text-foreground text-lg'>
                    {t("onboarding.roleSelection.teacher")}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {t("onboarding.roleSelection.teacherDescription")}
                  </div>
                </div>
              </div>
              {selectedRole === "teacher" && (
                <div className='w-6 h-6 bg-foreground rounded-full flex items-center justify-center'>
                  <Check className='w-4 h-4 text-background' />
                </div>
              )}
            </div>
          </button>
        </div>

        <SwitchButton
          onPre={onBack}
          onNext={onNext}
          disablePre={!selectedRole}
        />
      </div>
    </div>
  );
}

export default RoleSelection;
