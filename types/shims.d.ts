/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "recharts";
declare module "cmdk";
declare module "vaul";
declare module "input-otp" {
  import * as React from "react";

  export interface OTPInputProps
    extends React.ComponentPropsWithoutRef<"input"> {
    value?: string;
    onChange?: (value: string) => void;
    maxLength?: number;
    containerClassName?: string;
  }

  export interface OTPInputContextValue {
    slots: Array<{
      char: string | null;
      hasFakeCaret: boolean;
      isActive: boolean;
    }>;
  }

  export const OTPInput: React.FC<OTPInputProps>;
  export const OTPInputContext: React.Context<OTPInputContextValue | null>;
}
declare module "react-resizable-panels";
declare module "react-hook-form" {
  import * as React from "react";

  export type FieldValues = Record<string, any>;
  export type FieldPath<TFieldValues extends FieldValues> = string;

  export interface ControllerRenderProps {
    name: string;
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
  }

  export interface ControllerFieldState {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    error?: {
      message?: string;
      type?: string;
    } | null;
  }

  export interface UseFormStateReturn {
    invalid: boolean;
    isDirty: boolean;
    isValidating: boolean;
    errors: Record<string, unknown>;
  }

  export interface ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  > {
    name: TName;
    control?: unknown;
    rules?: Record<string, unknown>;
    render: (props: {
      field: ControllerRenderProps;
      fieldState: ControllerFieldState;
      formState: UseFormStateReturn;
    }) => React.ReactNode;
  }

  export const Controller: <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  >(
    props: ControllerProps<TFieldValues, TName>,
  ) => JSX.Element;

  export interface FormProviderProps {
    children?: React.ReactNode;
  }

  export const FormProvider: React.FC<FormProviderProps & Record<string, unknown>>;

  export const useFormContext: () => {
    getFieldState: (
      name: string,
      formState?: UseFormStateReturn,
    ) => ControllerFieldState;
  };

  export const useFormState: (props: { name: string }) => UseFormStateReturn;
}
declare module "next-themes" {
  export function useTheme(): { theme?: string; setTheme?: (theme: string) => void };
}

declare module "sonner" {
  import * as React from "react";

  export interface ToasterProps extends React.ComponentPropsWithoutRef<"div"> {
    theme?: "light" | "dark" | "system" | string;
    position?: string;
  }

  export const Toaster: React.FC<ToasterProps>;
  export const toast: (...args: any[]) => void;
}
