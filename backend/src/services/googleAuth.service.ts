import { google, oauth2_v2 } from 'googleapis';
import logger from '../utils/logger';

interface ITokenResponse {
  access_token?: string;
  refresh_token?: string;
  expiry_date?: number;
  id_token?: string;
}

class GoogleAuthService {
  oauth2Client: any;
  scopes: string[];

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, process.env.GOOGLE_REDIRECT_URI!);

    this.scopes = ['https://mail.google.com/', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent',
    });
  }

  async getTokens(code: string): Promise<ITokenResponse> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      logger.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  async getUserInfo(accessToken: string): Promise<oauth2_v2.Schema$Userinfo> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();
      return data;
    } catch (error) {
      logger.error('Error getting user info:', error);
      throw new Error('Failed to get user information from Google');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<ITokenResponse> {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  async verifyToken(accessToken: string): Promise<oauth2_v2.Schema$Tokeninfo | null> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: accessToken,
        audience: process.env.GOOGLE_CLIENT_ID!,
      });
      return ticket.getPayload();
    } catch (error) {
      logger.error('Error verifying token:', error);
      return null;
    }
  }

  generateXOAuth2Token(email: string, accessToken: string): string {
    const authString = `user=${email}\x01auth=Bearer ${accessToken}\x01\x01`;
    return Buffer.from(authString).toString('base64');
  }
}

export default new GoogleAuthService();
