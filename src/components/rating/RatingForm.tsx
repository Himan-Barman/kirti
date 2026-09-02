import React, { useState } from 'react';
import type { RatingFormValues, RatingScores } from '../../types/database.types';
import { RatingRow } from './RatingRow';
import { Button } from '../ui';
import { Send, AlertCircle } from 'lucide-react';

export interface RatingFormProps {
  initialValues?: {
    scores?: RatingScores;
    review?: string;
  };
  onSubmit: (values: {
    overall: 1 | 2 | 3 | 4 | 5;
    theme: 1 | 2 | 3 | 4 | 5;
    idol: 1 | 2 | 3 | 4 | 5;
    lighting: 1 | 2 | 3 | 4 | 5;
    management: 1 | 2 | 3 | 4 | 5;
    review?: string;
  }) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [form, setForm] = useState<RatingFormValues>({
    overall: (initialValues?.scores?.overall as 1 | 2 | 3 | 4 | 5) || null,
    theme: (initialValues?.scores?.theme as 1 | 2 | 3 | 4 | 5) || null,
    idol: (initialValues?.scores?.idol as 1 | 2 | 3 | 4 | 5) || null,
    lighting: (initialValues?.scores?.lighting as 1 | 2 | 3 | 4 | 5) || null,
    management: (initialValues?.scores?.management as 1 | 2 | 3 | 4 | 5) || null,
    review: initialValues?.review || ''
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleScoreChange = (dim: keyof RatingFormValues, val: 1 | 2 | 3 | 4 | 5) => {
    setForm(prev => ({ ...prev, [dim]: val }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!form.overall || !form.theme || !form.idol || !form.lighting || !form.management) {
      setErrorMessage('Please provide a 1–5 star rating for all 5 dimensions.');
      return;
    }

    try {
      await onSubmit({
        overall: form.overall,
        theme: form.theme,
        idol: form.idol,
        lighting: form.lighting,
        management: form.management,
        review: form.review?.trim()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit rating.');
    }
  };

  return (
    <form className="pandal-rating-form" onSubmit={handleSubmit}>
      <div className="form-header-instructions">
        <h4 className="form-head-title">Rate this Pandal</h4>
        <p className="form-head-sub">
          Rate across all 5 dimensions (1–5 stars). Overall impression is rated explicitly by you.
        </p>
      </div>

      {/* 5 Rating Dimension Rows */}
      <div className="dimensions-input-list">
        <RatingRow
          code="overall"
          label="Overall"
          labelBn="সামগ্রিক"
          value={form.overall}
          onChange={(val) => handleScoreChange('overall', val)}
          required={true}
          hasError={attemptedSubmit && !form.overall}
        />

        <RatingRow
          code="theme"
          label="Theme"
          labelBn="থিম"
          value={form.theme}
          onChange={(val) => handleScoreChange('theme', val)}
          required={true}
          hasError={attemptedSubmit && !form.theme}
        />

        <RatingRow
          code="idol"
          label="Idol"
          labelBn="প্রতিমা"
          value={form.idol}
          onChange={(val) => handleScoreChange('idol', val)}
          required={true}
          hasError={attemptedSubmit && !form.idol}
        />

        <RatingRow
          code="lighting"
          label="Lighting"
          labelBn="আলোসজ্জা"
          value={form.lighting}
          onChange={(val) => handleScoreChange('lighting', val)}
          required={true}
          hasError={attemptedSubmit && !form.lighting}
        />

        <RatingRow
          code="management"
          label="Management"
          labelBn="ব্যবস্থাপনা"
          value={form.management}
          onChange={(val) => handleScoreChange('management', val)}
          required={true}
          hasError={attemptedSubmit && !form.management}
        />
      </div>



      {/* Error Message Alert */}
      {errorMessage && (
        <div className="rating-form-error">
          <AlertCircle size={14} className="err-icon" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="form-actions-row">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="md"
            rounded="full"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          rounded="full"
          icon={isSubmitting ? undefined : <Send size={14} />}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : initialValues?.scores ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </div>

      <style>{`
        .pandal-rating-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-header-instructions {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .form-head-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .form-head-sub {
          font-size: 12px;
          color: var(--text-muted);
        }
        .dimensions-input-list {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 6px 16px;
        }
        .review-input-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .review-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .review-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .char-counter {
          font-size: 11px;
          color: var(--text-muted);
        }
        .rating-form-error {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(180, 35, 42, 0.08);
          border: 1px solid rgba(180, 35, 42, 0.2);
          border-radius: var(--radius-md);
          color: var(--kirti-red);
          font-size: 12px;
          font-weight: 600;
        }
        .err-icon {
          flex-shrink: 0;
        }
        .form-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }
      `}</style>
    </form>
  );
};
