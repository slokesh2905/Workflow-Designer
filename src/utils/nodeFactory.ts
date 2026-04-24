/**
 * utils/nodeFactory.ts
 *
 * Factory that creates a WorkflowNode with type-safe default data for
 * any NodeType. Used by the canvas onDrop handler.
 */
import { NodeType } from '@/types';
import type { WorkflowNode } from '@/types';

export function createDefaultNode(
  type: NodeType,
  position: { x: number; y: number },
): WorkflowNode {
  const id = `node-${crypto.randomUUID()}`;

  switch (type) {
    case NodeType.Start:
      return {
        id, type, position,
        data: { title: 'Start', metadata: {} },
      };

    case NodeType.Task:
      return {
        id, type, position,
        data: {
          title: 'New Task',
          description: '',
          assignee: '',
          dueDate: '',
          customFields: {},
        },
      };

    case NodeType.Approval:
      return {
        id, type, position,
        data: {
          title: 'Approval',
          approverRole: 'Manager',
          autoApproveThreshold: 80,
        },
      };

    case NodeType.AutomatedStep:
      return {
        id, type, position,
        data: { title: 'Automated Step', actionId: '', actionParams: {} },
      };

    case NodeType.End:
      return {
        id, type, position,
        data: { endMessage: 'Process complete', summaryFlag: false },
      };
  }
}
