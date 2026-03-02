export declare function getWeekLabel(date: Date): string;
export declare function getWeekStart(date: Date): Date;
export declare function getWeekRange(weekLabel: string): {
    start: Date;
    end: Date;
};
export declare function getPreviousWeekLabel(weekLabel: string): string;
export declare function getNextWeekLabel(weekLabel: string): string;
export declare function getCurrentWeekLabel(): string;
export declare function formatWeekLabel(weekLabel: string): string;
