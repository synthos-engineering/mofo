# SSL/WSS Configuration Guide

This guide explains how to set up and use secure WebSocket connections (WSS) with the EEG Booth System using self-signed certificates.

## 🔐 Certificate Authority Setup

### 1. Generate Certificates
```bash
# From the eeg-booth directory
./create-certificates.sh
```

This creates:
- **CA Certificate**: `certificates/ca-certificate.pem` (install on clients)
- **Server Certificate**: `certificates/relayer-certificate.pem`
- **Server Private Key**: `certificates/relayer-private-key.pem`
- **Full Chain**: `certificates/relayer-fullchain.pem`

### 2. Certificate Details
- **Valid for IP**: 172.24.244.146
- **Alternative Names**: 127.0.0.1, localhost, relayer.local
- **Validity**: 365 days
- **Algorithm**: RSA 4096-bit

## 🚀 Starting Secure Services

### 1. Start SSL Relayer Server
```bash
cd relayer-server
./start-relayer-ssl.sh
```
- **Secure URL**: `wss://172.24.244.146:8765`
- **Protocol**: WebSocket Secure (WSS)
- **Port**: 8765

### 2. Start Booth System
```bash
./start-booth.sh
```
- Booth backend connects to `wss://172.24.244.146:8765`
- Booth frontend generates QR codes with WSS URLs
- **Booth Frontend**: http://localhost:3003

### 3. Start Scanner
```bash
cd mock-scanner-frontend
PORT=3001 HOST=0.0.0.0 npm start
```
- Scanner connects to `wss://172.24.244.146:8765`
- **Scanner URL**: http://localhost:3001 (accessible on network)

## 🔗 SSL Configuration

### Relayer Server
- **Environment Variables**:
  - `USE_SSL=true` (enables SSL)
  - `PORT=8765` (server port)
- **Certificates**: Loaded from `../certificates/`
- **SSL Context**: TLS Server with certificate chain

### Booth Backend
- **Default URL**: `wss://172.24.244.146:8765`
- **SSL Verification**: Disabled for self-signed certificates
- **Auto-retry**: 5 attempts with exponential backoff

### Scanner Frontend
- **Default URL**: `wss://172.24.244.146:8765`
- **QR Code Support**: Reads WSS URLs from booth QR codes
- **Manual Entry**: Uses WSS by default

## 📱 Client Configuration

### Browser Setup
For browsers to accept self-signed certificates:

1. **Visit**: https://172.24.244.146:8765 in browser
2. **Accept**: Security warning for self-signed certificate
3. **Add Exception**: Permanently accept the certificate

### Production Setup
For production environments:

1. **Use CA-signed certificates** from trusted authority
2. **Enable certificate verification** in clients
3. **Use proper domain names** instead of IP addresses
4. **Implement certificate renewal** processes

## 🛡️ Security Features

### SSL/TLS Configuration
- **Protocol**: TLS 1.2+
- **Cipher Suites**: Strong encryption only
- **Certificate Validation**: Self-signed with custom CA
- **Key Exchange**: RSA 4096-bit

### WebSocket Security
- **Encrypted Transport**: All data encrypted in transit
- **Certificate Pinning**: Clients can pin CA certificate
- **Origin Validation**: Configure allowed origins
- **Authentication**: Add token-based auth for production

## 🔧 Troubleshooting

### Common SSL Issues

**1. Certificate Not Trusted**
```
Error: self signed certificate
```
**Solution**: Install `ca-certificate.pem` on client devices or disable verification for development.

**2. Hostname Mismatch**
```
Error: Hostname/IP does not match certificate's altnames
```
**Solution**: Connect using 172.24.244.146, not localhost or other IPs.

**3. Port Already in Use**
```
OSError: [Errno 48] Address already in use
```
**Solution**: 
```bash
lsof -i :8765  # Find process using port
kill <PID>     # Stop the process
```

**4. Certificate Files Not Found**
```
SSL certificates not found in certificates/
```
**Solution**: Run `./create-certificates.sh` to generate certificates.

### Connection Testing

**Test WSS Connection:**
```bash
# Install websocat for testing
brew install websocat

# Test connection
websocat --insecure wss://172.24.244.146:8765
```

**Browser Console Test:**
```javascript
const ws = new WebSocket('wss://172.24.244.146:8765');
ws.onopen = () => console.log('Connected!');
ws.onerror = (error) => console.log('Error:', error);
```

## 📊 System Architecture

```
Scanner (HTTPS) → WSS → SSL Relayer → WSS → Booth Backend
     ↓                      ↓                    ↓
QR Code Scanner    Certificate Authority    Flask API
  (Port 3001)      (Self-signed certs)    (Port 3004)
```

### Security Flow
1. **Certificate Authority** signs server certificates
2. **Relayer Server** presents certificate to clients
3. **Clients** verify certificate against CA (or skip verification)
4. **Encrypted Connection** established using TLS
5. **WebSocket Upgrade** over secure HTTPS connection

## 🔄 Certificate Renewal

### Manual Renewal
```bash
# Regenerate certificates (365 days validity)
./create-certificates.sh

# Restart relayer server
cd relayer-server
./start-relayer-ssl.sh
```

### Automated Renewal
For production, implement automated certificate renewal:
1. Monitor certificate expiry dates
2. Generate new certificates before expiry
3. Gracefully restart services with new certificates
4. Update client certificate stores if needed

## 🌐 Network Configuration

### Firewall Rules
Ensure port 8765 is open for WSS connections:
```bash
# macOS
sudo pfctl -f /etc/pf.conf

# Linux (ufw)
sudo ufw allow 8765

# Linux (iptables)
sudo iptables -A INPUT -p tcp --dport 8765 -j ACCEPT
```

### DNS Configuration
For production, consider:
- Using domain names instead of IP addresses
- Setting up proper DNS records
- Implementing certificate transparency logging
- Using Let's Encrypt for trusted certificates