'use client'

import { useState, useCallback } from 'react'

// Button Component - CMS Renderer Specification
// Based on BUTTON.md specification

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonType = 'button' | 'submit' | 'reset'
export type AlignType = 'left' | 'center' | 'right'
export type CenterMode = 'viewport' | 'container'

export interface ModalAction {
  type: 'openModal' | 'closeModal' | 'toggleModal'
  targetId: string
  preventDefault?: boolean
}

export interface ApiAction {
  type: string
  url: string
  method?: 'POST' | 'PUT' | 'PATCH' | 'GET'
  headers?: Record<string, string>
  body?: Record<string, any>
  bodyType?: 'json' | 'form'
  credentials?: 'omit' | 'same-origin' | 'include'
  tokenPath?: string
  tokenStorageKey?: string
  redirectTo?: string
  onSuccess?: {
    strategy?: 'redirect' | 'reload' | 'none'
    message?: string
  }
  onError?: {
    strategy?: 'toast' | 'alert' | 'none'
    message?: string
  }
}

export interface ButtonProps {
  // Required
  text: string

  // Optional
  href?: string
  variant?: ButtonVariant
  size?: ButtonSize
  type?: ButtonType
  fullWidth?: boolean
  centered?: boolean
  centerMode?: CenterMode
  align?: AlignType
  className?: string
  containerClassName?: string
  style?: React.CSSProperties
  target?: string
  rel?: string
  ariaLabel?: string
  id?: string
  disabled?: boolean
  loadingText?: string

  // Actions
  action?: ModalAction
  api?: ApiAction

  // Events
  onClick?: (e: React.MouseEvent) => void
}

// Variant classes mapping
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
  outline: 'bg-transparent border-2 border-current text-blue-600 hover:bg-blue-50',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
}

// Size classes mapping
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

// Alignment classes
const alignClasses: Record<AlignType, string> = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
}

// Center mode classes
const centerModeClasses: Record<CenterMode, string> = {
  viewport: 'fixed inset-0 flex items-center justify-center',
  container: 'flex items-center justify-center',
}

export default function Button({
  text,
  href,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  centered = false,
  centerMode = 'container',
  align = 'left',
  className = '',
  containerClassName = '',
  style = {},
  target,
  rel,
  ariaLabel,
  id,
  disabled = false,
  loadingText = 'Loading...',
  action,
  api,
  onClick,
}: ButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Build base classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    border
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  // Container classes
  const containerClasses = centered
    ? centerModeClasses[centerMode]
    : alignClasses[align]

  // Handle modal action
  const handleModalAction = useCallback(() => {
    if (!action) return

    const event = new CustomEvent('cms:modal', {
      detail: {
        type: action.type,
        targetId: action.targetId,
      },
    })
    window.dispatchEvent(event)
  }, [action])

  // Handle API action
  const handleApiAction = useCallback(async () => {
    if (!api) return

    setIsSubmitting(true)
    setIsLoading(true)

    // Extract error config for use in catch block
    const errorConfig = api.onError

    try {
      const { url, method = 'POST', headers = {}, body, bodyType = 'json', credentials = 'same-origin', tokenPath, tokenStorageKey = 'auth_token', redirectTo, onSuccess, onError } = api

      // Build request options
      const requestHeaders: Record<string, string> = { ...headers }

      // Add body for non-GET requests
      let requestBody: string | undefined
      if (method !== 'GET' && body) {
        if (bodyType === 'form') {
          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
          requestBody = new URLSearchParams(body).toString()
        } else {
          requestHeaders['Content-Type'] = 'application/json'
          requestBody = JSON.stringify(body)
        }
      }

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        credentials,
        body: requestBody,
      }

      const response = await fetch(url, requestOptions)
      const data = await response.json().catch(() => null)

      if (response.ok) {
        // Handle token extraction
        if (tokenPath && data) {
          const tokens = tokenPath.split('.')
          let tokenValue: any = data
          for (const key of tokens) {
            tokenValue = tokenValue?.[key]
          }
          if (tokenValue) {
            localStorage.setItem(tokenStorageKey, tokenValue)
          }
        }

        // Handle success
        const successStrategy = onSuccess?.strategy ?? 'redirect'
        if (successStrategy === 'redirect' && redirectTo) {
          window.location.href = redirectTo
        } else if (successStrategy === 'reload') {
          window.location.reload()
        }

        if (onSuccess?.message) {
          // Could integrate with toast system
          console.log(onSuccess.message)
        }
      } else {
        // Handle error
        const errorStrategy = onError?.strategy ?? 'alert'
        const errorMessage = onError?.message ?? 'An error occurred'

        if (errorStrategy === 'alert') {
          alert(errorMessage)
        } else if (errorStrategy === 'toast') {
          // Could integrate with toast system
          console.error(errorMessage)
        }
      }
    } catch (error) {
      console.error('API action failed:', error)
      const errorStrategy = errorConfig?.strategy ?? 'alert'
      const errorMessage = errorConfig?.message ?? 'An error occurred'

      if (errorStrategy === 'alert') {
        alert(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }, [api])

  // Handle click
  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      // Prevent default for modal actions if configured
      if (action?.preventDefault !== false) {
        e.preventDefault()
      }

      // Prevent if already submitting
      if (isSubmitting || isLoading) {
        e.preventDefault()
        return
      }

      // Call external onClick if provided
      onClick?.(e)

      // Handle modal action
      if (action) {
        handleModalAction()
      }

      // Handle API action
      if (api) {
        await handleApiAction()
      }
    },
    [action, api, isSubmitting, isLoading, onClick, handleModalAction, handleApiAction]
  )

  // Determine if we render as anchor or button
  const isLink = !!href && !action && !api

  // Compute rel attribute for external links
  const computedRel = target === '_blank' && !rel
    ? 'noopener noreferrer'
    : rel

  // Loading state text
  const displayText = isLoading || isSubmitting ? loadingText : text

  const buttonElement = isLink ? (
    <a
      href={href}
      className={baseClasses}
      style={style}
      target={target}
      rel={computedRel}
      aria-label={ariaLabel}
      id={id}
      onClick={onClick}
    >
      {displayText}
    </a>
  ) : (
    <button
      type={type}
      className={baseClasses}
      style={style}
      disabled={disabled || isSubmitting}
      aria-label={ariaLabel}
      id={id}
      onClick={handleClick}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {displayText}
    </button>
  )

  // Wrap in container if needed
  if (centered || containerClassName) {
    return (
      <div className={`${containerClasses} ${containerClassName}`}>
        {buttonElement}
      </div>
    )
  }

  return buttonElement
}

// Helper function to dispatch modal events (for external use)
export function dispatchModalAction(type: 'openModal' | 'closeModal' | 'toggleModal', targetId: string) {
  const event = new CustomEvent('cms:modal', {
    detail: { type, targetId },
  })
  window.dispatchEvent(event)
}
