import { QRCodeSVG } from 'qrcode.react'
import { Appear } from '../components/Appear'
import { MaskText } from '../components/MaskText'
import { colX, spanW } from './layout'

export function S10YourTurn() {
  return (
    <>
      <Appear style={{ position: 'absolute', left: colX(1), top: 370 }}>
        <div className="kicker">Your turn</div>
      </Appear>
      <MaskText as="h1" className="h1" text="react.dev/learn" style={{ position: 'absolute', left: colX(1), top: 420, width: spanW(8) }} />
      <Appear delay={0.3} style={{ position: 'absolute', left: colX(1), top: 580, width: spanW(7) }}>
        <p className="body muted">The official tutorial, from the team behind React.</p>
      </Appear>

      <Appear delay={0.2} from={{ opacity: 0, scale: 0.94 }} style={{ position: 'absolute', left: colX(9) + 24, top: 290, width: spanW(4) - 24 }}>
        <div className="qr">
          <QRCodeSVG value="https://react.dev/learn" size={400} bgColor="#F4F2EE" fgColor="#0A0A0A" marginSize={4} level="M" />
        </div>
        <p className="caption" style={{ marginTop: 20 }}>
          Scan to open react.dev/learn
        </p>
      </Appear>
    </>
  )
}
