#!/bin/bash

# Self-Signed Certificate Authority Setup Script
echo "🔐 Creating Self-Signed Certificate Authority for WSS Support"

# Create certificates directory
CERT_DIR="$(pwd)/certificates"
mkdir -p "$CERT_DIR"
cd "$CERT_DIR"

echo "📁 Working in: $CERT_DIR"

# Configuration variables
COUNTRY="US"
STATE="California"
CITY="San Francisco"
ORG="EEG Booth System"
ORG_UNIT="Development"
RELAYER_IP="172.24.244.146"
VALIDITY_DAYS=365

echo "🏗️  Step 1: Creating Certificate Authority (CA)"

# Generate CA private key
openssl genrsa -aes256 -passout pass:capassword -out ca-private-key.pem 4096

# Generate CA certificate
cat > ca.conf << EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_ca
prompt = no

[req_distinguished_name]
C = $COUNTRY
ST = $STATE
L = $CITY
O = $ORG
OU = $ORG_UNIT
CN = EEG Booth CA

[v3_ca]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:TRUE
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
EOF

openssl req -new -x509 -key ca-private-key.pem -out ca-certificate.pem -days $VALIDITY_DAYS -config ca.conf -passin pass:capassword

echo "✅ Certificate Authority created"

echo "🔑 Step 2: Creating Relayer Server Certificate"

# Generate server private key
openssl genrsa -out relayer-private-key.pem 4096

# Create server certificate configuration
cat > relayer.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = $COUNTRY
ST = $STATE
L = $CITY
O = $ORG
OU = $ORG_UNIT
CN = $RELAYER_IP

[v3_req]
keyUsage = keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
IP.1 = $RELAYER_IP
IP.2 = 127.0.0.1
DNS.1 = localhost
DNS.2 = relayer.local
EOF

# Generate Certificate Signing Request (CSR)
openssl req -new -key relayer-private-key.pem -out relayer-csr.pem -config relayer.conf

# Sign the server certificate with CA
openssl x509 -req -in relayer-csr.pem -CA ca-certificate.pem -CAkey ca-private-key.pem -CAcreateserial -out relayer-certificate.pem -days $VALIDITY_DAYS -extensions v3_req -extfile relayer.conf -passin pass:capassword

echo "✅ Relayer server certificate created"

echo "🔧 Step 3: Creating certificate bundle for applications"

# Create certificate bundle (certificate + intermediate + root)
cat relayer-certificate.pem ca-certificate.pem > relayer-fullchain.pem

# Set appropriate permissions
chmod 600 *-private-key.pem
chmod 644 *.pem
chmod 644 *.conf

echo "📋 Step 4: Certificate Information"

echo ""
echo "📁 Certificates created in: $CERT_DIR"
echo ""
echo "📄 Files generated:"
echo "   • ca-certificate.pem         - CA Root Certificate (install on clients)"
echo "   • ca-private-key.pem         - CA Private Key (keep secure)"
echo "   • relayer-certificate.pem    - Server Certificate"
echo "   • relayer-private-key.pem    - Server Private Key"
echo "   • relayer-fullchain.pem      - Full Certificate Chain"
echo "   • relayer-csr.pem           - Certificate Signing Request"
echo ""
echo "🔐 Server Details:"
echo "   • IP Address: $RELAYER_IP"
echo "   • Valid for: $VALIDITY_DAYS days"
echo "   • Subject Alternative Names: IP:$RELAYER_IP, IP:127.0.0.1, DNS:localhost"
echo ""
echo "📱 Next Steps:"
echo "   1. Update relayer server to use SSL certificates"
echo "   2. Install ca-certificate.pem on client devices"
echo "   3. Update client URLs from ws:// to wss://"
echo ""

# Verify certificates
echo "🔍 Certificate Verification:"
echo ""
echo "CA Certificate:"
openssl x509 -in ca-certificate.pem -text -noout | grep -A2 "Subject:"
echo ""
echo "Server Certificate:"
openssl x509 -in relayer-certificate.pem -text -noout | grep -A2 "Subject:"
openssl x509 -in relayer-certificate.pem -text -noout | grep -A5 "Subject Alternative Name"

echo ""
echo "✅ Certificate Authority setup complete!"
echo "🔐 Ready to enable WSS on relayer server"