import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const sendTransactionMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@tonconnect/ui-react', () => ({
  TonConnectUIProvider: ({ children }: { children: React.ReactNode }) => children,
  TonConnectButton: () => <button>Connect</button>,
  useTonConnectUI: () => [{ sendTransaction: sendTransactionMock }]
}));

describe('App', () => {
  beforeEach(() => {
    sendTransactionMock.mockClear();
  });

  it('renders RU by default and switches to EN', async () => {
    render(<App />);
    expect(screen.getByText('LFGsyndicate DAO')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Оплатить' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
  });

  it('sends transaction with correct amount when valid number entered', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Сумма в TON (например, 10)');
    await userEvent.clear(input);
    await userEvent.type(input, '1.5');
    await userEvent.click(screen.getByRole('button', { name: 'Оплатить' }));

    expect(sendTransactionMock).toHaveBeenCalledTimes(1);
    const arg = sendTransactionMock.mock.calls[0][0];
    expect(arg.messages).toHaveLength(1);
    expect(arg.messages[0].amount).toBe('1500000000');
  });

  it('does not send transaction on invalid amount', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Сумма в TON (например, 10)');
    await userEvent.clear(input);
    await userEvent.type(input, 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Оплатить' }));
    expect(sendTransactionMock).not.toHaveBeenCalled();
  });
});


