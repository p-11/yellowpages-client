import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const btc = decodeURIComponent(searchParams.get('btc') ?? '');
  const mldsa44 = decodeURIComponent(searchParams.get('mldsa44') ?? '');

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#E8D674',
          display: 'flex',
          justifyContent: 'center',
          gap: 68,
          flexDirection: 'column',
          paddingLeft: 60,
          paddingRight: 60,
          height: '100%',
          width: '100%'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '100%',
              border: '2px solid #1E0B00',
              borderRadius: '6px',
              position: 'relative',
              paddingTop: '16px',
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingBottom: '26px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                backgroundColor: '#E8D674',
                position: 'absolute',
                top: '-18px',
                left: '14px',
                paddingRight: '6px',
                paddingLeft: '6px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <span style={{ fontSize: 24 }}>ENTRY</span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: '20px'
              }}
            >
              <span style={{ fontSize: 24 }}>Bitcoin address</span>
              <div
                style={{
                  height: '1px',
                  marginTop: 4,
                  flex: 1,
                  borderTop: '1px dashed #111'
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                gap: '4px',
                paddingBottom: '8px',
                paddingTop: '8px',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginTop: '8px',
                marginLeft: '16px'
              }}
            >
              <span style={{ wordBreak: 'break-all', fontSize: 24 }}>
                {btc}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: '20px'
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 24
                }}
              >
                Post-Quantum ML-DSA-44 address
              </span>
              <div
                style={{
                  height: '1px',
                  marginTop: 4,
                  flex: 1,
                  borderTop: '1px dashed #111'
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                gap: '4px',
                paddingBottom: '8px',
                paddingTop: '8px',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginTop: '8px',
                marginLeft: '16px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ wordBreak: 'break-all', fontSize: 24 }}>
                  {mldsa44}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ fontSize: 24 }}>
            I found myself in the post-quantum world. Get protected and join the
            yellowpages.
          </span>
          <span style={{ fontSize: 24 }}>yellowpages.xyz</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
