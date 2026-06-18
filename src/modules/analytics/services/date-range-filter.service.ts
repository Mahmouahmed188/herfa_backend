import { Injectable } from '@nestjs/common';
import { DateRangePreset } from '../dto/date-range-filter.dto';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class DateRangeFilterService {
  resolve(
    preset?: DateRangePreset,
    startDate?: string,
    endDate?: string,
  ): DateRange {
    if (preset) {
      return this.resolvePreset(preset);
    }
    if (startDate && endDate) {
      return {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }
    return this.resolvePreset(DateRangePreset.LAST_30_DAYS);
  }

  private resolvePreset(preset: DateRangePreset): DateRange {
    const now = new Date();
    const endDate = new Date(now);
    let startDate: Date;

    switch (preset) {
      case DateRangePreset.TODAY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case DateRangePreset.LAST_7_DAYS:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case DateRangePreset.LAST_30_DAYS:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case DateRangePreset.LAST_90_DAYS:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    return { startDate, endDate };
  }
}
