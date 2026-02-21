import { useTranslation } from "react-i18next";

interface ChecklistItem {
  label: string;
  checked: boolean;
}

type Props = {
  items: ChecklistItem[];
  onItemChange: (idx: number, checked: boolean) => void;
  completionRate: number;
};

const Checklist = ({ items, onItemChange, completionRate }: Props) => {
  const { t } = useTranslation();

  return (
    <div className='bg-card rounded-xl p-6 shadow-sm'>
      <h2 className='font-semibold mb-4'>{t("card.checklist.title")}</h2>
      <div className='grid grid-cols-2 gap-4 mb-4'>
        {items.map((item, idx) => (
          <label key={idx} className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={item.checked}
              onChange={(e) => onItemChange(idx, e.target.checked)}
              className='w-4 h-4'
            />
            <span className='text-sm'>{item.label}</span>
          </label>
        ))}
      </div>
      <div className='flex items-center justify-between'>
        <button className='bg-card-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer'>
          <span>+</span> {t("card.checklist.seeMore")}
        </button>
        <div className='flex items-center justify-center w-16 h-16 border-4 border-card-secondary rounded-full'>
          <span className='text-xl font-bold'>{completionRate}%</span>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
