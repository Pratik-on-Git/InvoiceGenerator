import * as React from 'react'

const MOBILE_BREAKPOINT = 1280

export function useIsMobile() {
  // Start undefined so the server render and the first client render agree
  // (both resolve to `false`). Reading window.innerWidth in the initializer
  // would make a narrow first client paint disagree with the server and break
  // hydration. The real value is measured in the effect, after mount.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    onChange()
    mql.addEventListener('change', onChange)

    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
