import type { RegisterOptions, UseFormRegister } from "react-hook-form";

interface InputProps {
  type: string;
  placeholder: string;
  name: string;
  register: UseFormRegister<any>;
  error?: string;
  rules?: RegisterOptions;
}

export function Input({
  name,
  type,
  placeholder,
  register,
  rules,
  error,
}: InputProps) {
  return (
    <div>
      <input
        className="w-full rounded-md h-11 px-2 bg-inputs placeholder:text-gray-900 border-none outline-none focus:ring-2 focus:ring-detalhes"
        type={type}
        placeholder={placeholder}
        {...register(name, rules)}
        id={name}
      />
      {error && <p className="my-1 text-red-800">{error}</p>}
    </div>
  );
}
