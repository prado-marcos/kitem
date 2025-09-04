import { StylesConfig } from 'react-select';

export const selectStyles: StylesConfig<any, false> = {
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    borderColor: state.isFocused ? '#9e000e' : '#d1d5db',
    '&:hover': {
      borderColor: '#9e000e',
    },
    boxShadow: state.isFocused ? '0 0 0 1px #9e000e' : 'none',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#9e000e' 
      : state.isFocused 
      ? '#fef2f2' 
      : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: state.isSelected ? '#9e000e' : '#fef2f2',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#374151',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
  }),
};
