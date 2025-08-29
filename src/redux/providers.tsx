'use client';
import { Provider } from 'react-redux';
import { store } from './store';

interface IProviders {
  children: any;
}
const Providers: React.FC<IProviders> = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

export default Providers;
