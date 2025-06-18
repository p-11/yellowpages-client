import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';
import { Network, validate } from 'bitcoin-address-validation';
import { decodeAddress } from '@project-eleven/pq-address';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const btc = decodeURIComponent(searchParams.get('btc') ?? '');
  const mldsa44 = decodeURIComponent(searchParams.get('mldsa44') ?? '');
  const slhdsaSha2S128 = decodeURIComponent(
    searchParams.get('slhdsaSha2S128') ?? ''
  );

  const isBitcoinAddressValid = validate(btc, Network.mainnet);

  if (!isBitcoinAddressValid) {
    return NextResponse.json(
      {},
      { status: 400, statusText: 'Invalid Bitcoin address' }
    );
  }

  try {
    decodeAddress(mldsa44);
  } catch {
    return NextResponse.json(
      {},
      { status: 400, statusText: 'Invalid ML-DSA-44 address' }
    );
  }

  try {
    decodeAddress(slhdsaSha2S128);
  } catch {
    return NextResponse.json(
      {},
      { status: 400, statusText: 'Invalid SLH-DSA-SHA2-128s address' }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#E8D674',
          display: 'flex',
          justifyContent: 'center',
          gap: 36,
          flexDirection: 'column',
          paddingLeft: 52,
          paddingRight: 52,
          height: '100%',
          width: '100%',
          color: '#1E0B00'
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
              marginTop: 6,
              paddingTop: '32px',
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingBottom: '42px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                backgroundColor: '#E8D674',
                position: 'absolute',
                top: '-17px',
                left: '14px',
                paddingRight: '6px',
                paddingLeft: '6px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <span style={{ fontSize: 22 }}>ENTRY</span>
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
                Post-Quantum SLH-DSA-SHA2-128-s address
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
                  {slhdsaSha2S128}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontSize: 24 }}>
            I found myself in the post-quantum world. Join the yellowpages.
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
