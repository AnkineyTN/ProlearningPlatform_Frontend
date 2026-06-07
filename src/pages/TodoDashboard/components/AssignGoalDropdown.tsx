import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { todoAPI } from '@/services/endpoints/todo';
import type { Goal, Todo } from '@/services/types/todo.types';

type AssignGoalDropdownProps = {
  todo: Todo;
  goals: Goal[];
};

const AssignGoalDropdown = ({ todo, goals }: AssignGoalDropdownProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: ({
      goalId,
      clearGoal,
    }: {
      goalId?: number;
      clearGoal?: boolean;
    }) => todoAPI.updateTodo(todo.id, { goalId, clearGoal }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['goals'] });
      setOpen(false);
    },
  });

  return (
    <div className='relative'>
      <button
        onClick={() => setOpen(!open)}
        className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-[var(--pl-bg-hover)]'
      >
        {todo.goalColor && (
          <span
            className='w-2 h-2 rounded-full inline-block'
            style={{ backgroundColor: todo.goalColor }}
          />
        )}
        {todo.goalTitle ?? t('todo.assignGoal.noGoal')}
        <ChevronDown className='w-3 h-3' />
      </button>

      {open && (
        <div className='absolute left-0 top-full mt-1 bg-[var(--pl-bg)] border border-ring rounded-xl shadow-lg z-20 min-w-48 py-1'>
          <button
            onClick={() => assignMutation.mutate({ clearGoal: true })}
            className='w-full text-left px-3 py-2 text-sm hover:bg-[var(--pl-bg-hover)] text-muted-foreground'
          >
            {t('todo.assignGoal.unassign')}
          </button>
          {goals.map((g) => (
            <button
              key={g.id}
              onClick={() => assignMutation.mutate({ goalId: g.id })}
              className='w-full text-left px-3 py-2 text-sm hover:bg-[var(--pl-bg-hover)] flex items-center gap-2'
            >
              <span
                className='w-2.5 h-2.5 rounded-full flex-shrink-0'
                style={{ backgroundColor: g.color ?? '#6366f1' }}
              />
              <span className='truncate'>{g.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignGoalDropdown;
