import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

/**
 * Password Input Component with Show/Hide Toggle
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onChange - Change handler
 * @param {string} props.value - Input value
 * @param {Object} props.rest - Other input props
 */
function PasswordInput({ className, onChange, value, ...props }) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        value={value}
        onChange={onChange}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

export { PasswordInput }

