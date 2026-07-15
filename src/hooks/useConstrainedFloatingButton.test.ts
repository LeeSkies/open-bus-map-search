import { renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { MAIN_SCROLL_CONTAINER_ID } from 'src/layout/constants'
import { useConstrainedFloatingButton } from './useConstrainedFloatingButton'

const observe = jest.fn()
const disconnect = jest.fn()

beforeAll(() => {
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: jest.fn(() => ({ disconnect, observe })),
  })
})

afterEach(() => {
  document.getElementById(MAIN_SCROLL_CONTAINER_ID)?.remove()
  document.documentElement.dir = ''
  observe.mockClear()
  disconnect.mockClear()
})

describe('useConstrainedFloatingButton', () => {
  it('tracks and cleans up the stable main scroll container', () => {
    const scrollContainer = document.createElement('main')
    scrollContainer.id = MAIN_SCROLL_CONTAINER_ID
    document.body.append(scrollContainer)
    const addEventListener = jest.spyOn(scrollContainer, 'addEventListener')
    const removeEventListener = jest.spyOn(scrollContainer, 'removeEventListener')

    const map = document.createElement('div')
    const button = document.createElement('button')
    jest.spyOn(map, 'getBoundingClientRect').mockReturnValue({
      bottom: 700,
      height: 600,
      left: 100,
      right: 500,
      top: 100,
      width: 400,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    })
    jest.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 48,
      left: 0,
      right: 0,
      top: 0,
      width: 48,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    const mapRef = createRef<HTMLDivElement>()
    const buttonRef = createRef<HTMLButtonElement>()
    mapRef.current = map
    buttonRef.current = button

    const { unmount } = renderHook(() => useConstrainedFloatingButton(mapRef, buttonRef, false))

    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(observe).toHaveBeenCalledWith(map)

    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(disconnect).toHaveBeenCalled()
  })

  it('pins an expanded button to the logical viewport edge in RTL', () => {
    document.documentElement.dir = 'rtl'
    const mapRef = createRef<HTMLDivElement>()
    const buttonRef = createRef<HTMLButtonElement>()
    mapRef.current = document.createElement('div')
    buttonRef.current = document.createElement('button')

    renderHook(() => useConstrainedFloatingButton(mapRef, buttonRef, true))

    expect(buttonRef.current.style.left).toBe('5px')
    expect(buttonRef.current.style.right).toBe('')
    expect(buttonRef.current.style.bottom).toBe('5px')
  })
})
