import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

describe('UI Components', () => {
  describe('Button', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should handle click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByText('Disabled')).toBeDisabled()
    })

    it('should render different variants', () => {
      const { rerender } = render(<Button variant="default">Default</Button>)
      expect(screen.getByText('Default')).toBeInTheDocument()

      rerender(<Button variant="outline">Outline</Button>)
      expect(screen.getByText('Outline')).toBeInTheDocument()

      rerender(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByText('Ghost')).toBeInTheDocument()
    })
  })

  describe('Input', () => {
    it('should render input with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should handle value changes', () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'new value' } })
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('should support different types', () => {
      const { rerender } = render(<Input type="text" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')

      rerender(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('Card', () => {
    it('should render card with content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
