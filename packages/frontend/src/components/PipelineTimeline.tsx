/**
 * PipelineTimeline — vertical, phase-grouped timeline for the Pipeline Monitor.
 *
 * Usage:
 *   <PipelineTimeline
 *     steps={steps}
 *     selectedStage={selectedStage}
 *     onSelectStage={setSelectedStage}
 *     currentStep={run.current_step}
 *   />
 */
import { useEffect, useRef } from 'react';
import type { PipelineStep } from '../api/types';
import { PIPELINE_PHASES, PIPELINE_STAGES } from '../constants/pipeline';
import StageCard from './StageCard';

export interface PipelineTimelineProps {
  steps: PipelineStep[];
  selectedStage: string | null;
  onSelectStage: (stageKey: string) => void;
  currentStep: string | null;
}

function isPhaseCompleted(phaseStages: string[], steps: PipelineStep[]): boolean {
  return phaseStages.every((stageKey) => {
    const step = steps.find((s) => s.step_key === stageKey);
    return step?.status === 'completed' || step?.status === 'skipped';
  });
}

function isPhaseActive(phaseStages: string[], steps: PipelineStep[]): boolean {
  return phaseStages.some((stageKey) => {
    const step = steps.find((s) => s.step_key === stageKey);
    return step?.status === 'running' || step?.status === 'waiting_for_gate';
  });
}

export default function PipelineTimeline({
  steps,
  selectedStage,
  onSelectStage,
  currentStep,
}: PipelineTimelineProps) {
  const currentRef = useRef<HTMLDivElement | null>(null);

  // Smooth-scroll to keep the current stage card visible
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStep]);

  return (
    <nav
      aria-label="生成流水线阶段"
      className="flex flex-col gap-0 overflow-y-auto custom-scrollbar"
    >
      {PIPELINE_PHASES.map((phase, phaseIdx) => {
        const completed = isPhaseCompleted(phase.stages, steps);
        const active = isPhaseActive(phase.stages, steps);

        // Determine connector line color going into this phase from the previous one
        // The line is accent if the previous phase is fully completed
        const prevPhase = phaseIdx > 0 ? PIPELINE_PHASES[phaseIdx - 1] : null;
        const connectorCompleted = prevPhase
          ? isPhaseCompleted(prevPhase.stages, steps)
          : false;

        return (
          <div key={phase.id} className="relative">
            {/* Vertical connector from previous phase */}
            {phaseIdx > 0 && (
              <div className="flex justify-start pl-[13px] mb-0">
                <div
                  className={`w-0.5 h-3 transition-colors duration-500 ${
                    connectorCompleted ? 'bg-accent/50' : 'bg-bdr'
                  }`}
                />
              </div>
            )}

            {/* Phase header */}
            <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  completed
                    ? 'bg-accent'
                    : active
                    ? 'bg-accent animate-pulse'
                    : 'bg-bdr'
                }`}
              />
              <span
                className={`text-caption uppercase tracking-wider font-medium transition-colors ${
                  completed
                    ? 'text-accent'
                    : active
                    ? 'text-txt-primary'
                    : 'text-txt-muted'
                }`}
              >
                {phase.label}
              </span>
              {completed && (
                <span className="text-[10px] text-accent font-medium ml-auto">完成</span>
              )}
            </div>

            {/* Stage cards with vertical line */}
            <div className="relative pl-3">
              {/* Vertical line through stages */}
              <div className="absolute left-3 top-0 bottom-0 flex flex-col pointer-events-none">
                <div
                  className={`w-0.5 flex-1 ml-[10px] transition-colors duration-500 ${
                    completed ? 'bg-accent/40' : 'bg-bdr/60'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-0.5 pl-6">
                {phase.stages.map((stageKey) => {
                  const stageInfo = PIPELINE_STAGES[stageKey];
                  if (!stageInfo) return null;
                  const step = steps.find((s) => s.step_key === stageKey);
                  const isCurrent = currentStep === stageKey;

                  return (
                    <div
                      key={stageKey}
                      ref={isCurrent ? currentRef : null}
                    >
                      <StageCard
                        stageKey={stageKey}
                        step={step}
                        isSelected={selectedStage === stageKey}
                        isCurrent={isCurrent}
                        onClick={() => onSelectStage(stageKey)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom spacing between phases */}
            <div className="h-2" />
          </div>
        );
      })}
    </nav>
  );
}
