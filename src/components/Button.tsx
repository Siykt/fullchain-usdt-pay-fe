import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';

const Container = styled.button`
  padding: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  border: 0;
  vertical-align: baseline;
  font-family: SFRounded, ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  background-color: #1a1b1f;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  --hover-scale: 1.025;
  --active-scale: 0.975;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(var(--hover-scale));
  }

  &:active {
    transform: scale(var(--active-scale));
  }

  > div {
    width: 100%;
    padding: 6px 8px;
    border-radius: 8px;
    border: 2px solid #1a1b1f;
    background-image: linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15));
  }
`;

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, className, onClick, disabled }) => {
  return (
    <Container className={className} onClick={onClick} disabled={disabled}>
      <div>{children}</div>
    </Container>
  );
};

export default Button;
