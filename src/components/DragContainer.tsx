import styled from '../theme';
export const DragContainer = styled.span<{
  isDragging?: boolean;
}>`
  position: absolute;
  left: 0;
  top: 0;
  transition: padding 0.2s;
  z-index: ${p => (p.isDragging ? 99 : 0)};
`;
