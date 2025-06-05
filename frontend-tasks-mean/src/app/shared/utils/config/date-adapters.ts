import { MatDateFormats } from '@angular/material/core';

export const MAT_DATE_CUSTOM_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'yyyy-MM-dd',
    monthYearLabel: 'LLL y',
    dateA11yLabel: 'MMMM d, y',
    monthYearA11yLabel: 'MMMM y',
  },
};
