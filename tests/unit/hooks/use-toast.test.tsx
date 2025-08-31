import { renderHook } from '@testing-library/react'
import { useToast } from '@/lib/notifications/toast-system'
import { AUTH_MESSAGES } from '@/lib/messages/auth-messages'
import { toast as sonnerToast } from 'sonner'

// Mock Sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    loading: jest.fn()
  }
}))

const mockSonnerToast = sonnerToast as jest.Mocked<typeof sonnerToast>

describe('useToast Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide toast system access', () => {
    const { result } = renderHook(() => useToast())
    
    expect(result.current.toast).toBeDefined()
    expect(result.current.businessToasts).toBeDefined()
  })

  it('should provide showAuthMessage helper', () => {
    const { result } = renderHook(() => useToast())
    
    result.current.showAuthMessage(AUTH_MESSAGES.login.success)
    
    expect(mockSonnerToast.success).toHaveBeenCalledWith(
      'Connexion réussie',
      expect.any(Object)
    )
  })

  it('should provide showSuccess helper', () => {
    const { result } = renderHook(() => useToast())
    
    result.current.showSuccess('Success title', 'Success description')
    
    expect(mockSonnerToast.success).toHaveBeenCalledWith(
      'Success title',
      expect.objectContaining({
        description: 'Success description'
      })
    )
  })

  it('should provide showError helper', () => {
    const { result } = renderHook(() => useToast())
    
    result.current.showError('Error title', 'Error description')
    
    expect(mockSonnerToast.error).toHaveBeenCalledWith(
      'Error title',
      expect.objectContaining({
        description: 'Error description'
      })
    )
  })

  it('should provide showInfo helper', () => {
    const { result } = renderHook(() => useToast())
    
    result.current.showInfo('Info title', 'Info description')
    
    expect(mockSonnerToast.info).toHaveBeenCalledWith(
      'Info title',
      expect.objectContaining({
        description: 'Info description'
      })
    )
  })

  it('should provide showLoading helper', () => {
    const { result } = renderHook(() => useToast())
    
    result.current.showLoading('Loading title')
    
    expect(mockSonnerToast.loading).toHaveBeenCalledWith(
      'Loading title',
      expect.any(Object)
    )
  })

  describe('Integration with components', () => {
    it('should work within React component context', () => {
      const TestComponent = () => {
        const { showSuccess } = useToast()
        
        React.useEffect(() => {
          showSuccess('Component mounted')
        }, [showSuccess])
        
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      expect(mockSonnerToast.success).toHaveBeenCalledWith(
        'Component mounted',
        expect.any(Object)
      )
    })
  })
})