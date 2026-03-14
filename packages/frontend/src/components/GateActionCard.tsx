/**
 * GateActionCard — Approval / rejection UI for pipeline gate stages.
 *
 * Shown in the detail panel when a gate stage is selected and its status
 * is `waiting_for_gate`.
 *
 * Usage:
 *   <GateActionCard
 *     gate="gate_creative"
 *     runId={run.id}
 *     onDecision={(decision) => console.log(decision)}
 *   />
 */
import { useState } from 'react';
import { ShieldCheck, MessageSquare, Loader2, ThumbsUp, RotateCcw } from 'lucide-react';
import { submitGateDecision } from '../api/runs';
import { PIPELINE_STAGES } from '../constants/pipeline';
import Button from './Button';

export interface GateActionCardProps {
  gate: string;
  runId: string;
  stepId?: string;
  onDecision: (decision: 'approve' | 'reject') => void;
}

export default function GateActionCard({ gate, runId, stepId, onDecision }: GateActionCardProps) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stageInfo = PIPELINE_STAGES[gate];
  const gateName = stageInfo?.label ?? gate;

  async function handleDecision(decision: 'approve' | 'reject') {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitGateDecision(stepId ?? gate, { decision, feedback: feedback.trim() || undefined });
      onDecision(decision);
    } catch {
      setSubmitError('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-status-waiting/10 border border-status-waiting/20 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-status-waiting" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-txt-primary leading-snug">
            {gateName}
          </h3>
          <p className="text-[13px] text-status-waiting font-medium mt-0.5">需要您的审核</p>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3 bg-surface-subtle rounded-xl border border-bdr-subtle">
        <p className="text-[13px] text-txt-secondary leading-relaxed">
          请检查以上阶段的输出结果，确认无误后批准继续。如有问题请填写意见后退回修改。
        </p>
      </div>

      {/* Feedback textarea */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`feedback-${gate}`}
          className="flex items-center gap-1.5 text-[12px] font-medium text-txt-secondary uppercase tracking-wide"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          审核意见（可选）
        </label>
        <textarea
          id={`feedback-${gate}`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="填写审核意见或修改建议..."
          disabled={submitting}
          rows={4}
          className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[13px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Error message */}
      {submitError && (
        <p className="text-[12px] text-status-failed bg-status-failed/8 px-3 py-2 rounded-lg border border-status-failed/20">
          {submitError}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="danger"
          size="md"
          icon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          onClick={() => handleDecision('reject')}
          disabled={submitting}
          className="flex-1"
          aria-label="退回修改"
        >
          退回修改
        </Button>
        <Button
          variant="outline"
          size="md"
          icon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
          onClick={() => handleDecision('approve')}
          disabled={submitting}
          className="flex-1 !bg-accent !text-white !border-accent hover:!bg-accent-dark"
          aria-label="批准通过"
        >
          批准通过
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-txt-muted text-center">
        批准后流水线将继续执行下一阶段 · 退回将重新执行本阶段
      </p>
    </div>
  );
}
