import { MessageSquare, Shield, UserCog, Phone, Mail, Globe, Send, Key } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

type NotificationTabProps = {
  activeTab: 'sms' | 'whatsapp' | 'email';
  smsProvider: string;
  setSmsProvider: (value: string) => void;
  africastalkingSettings: any;
  setAfricastalkingSettings: (value: any) => void;
  twilioSettings: any;
  setTwilioSettings: (value: any) => void;
  whatsappSettings: any;
  setWhatsappSettings: (value: any) => void;
  emailSettings: any;
  setEmailSettings: (value: any) => void;
  onSave: () => void;
  isOnline: boolean;
};

export function NotificationsTabContent({
  activeTab,
  smsProvider,
  setSmsProvider,
  africastalkingSettings,
  setAfricastalkingSettings,
  twilioSettings,
  setTwilioSettings,
  whatsappSettings,
  setWhatsappSettings,
  emailSettings,
  setEmailSettings,
  onSave,
  isOnline
}: NotificationTabProps) {
  return (
    <>
      {/* SMS Tab Content */}
      {activeTab === 'sms' && (
        <>
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#36454F]">Select SMS Provider</label>
            <Select value={smsProvider} onValueChange={setSmsProvider}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="africastalking">Africa's Talking</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Africa's Talking Settings */}
          {smsProvider === 'africastalking' && (
            <div className="space-y-4 bg-[#FAF4EC] rounded-xl p-6 border border-[#36454F]/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6B7F39] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-[#36454F]">Africa's Talking Settings</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Shield className="w-4 h-4 text-[#6B7F39]" />
                    API Key
                  </label>
                  <Input
                    type="password"
                    value={africastalkingSettings.apiKey}
                    onChange={(e) => setAfricastalkingSettings({...africastalkingSettings, apiKey: e.target.value})}
                    placeholder="Enter API key"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <UserCog className="w-4 h-4 text-[#6B7F39]" />
                    Username
                  </label>
                  <Input
                    value={africastalkingSettings.username}
                    onChange={(e) => setAfricastalkingSettings({...africastalkingSettings, username: e.target.value})}
                    placeholder="Enter username"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Phone className="w-4 h-4 text-[#6B7F39]" />
                    Shortcode
                  </label>
                  <Input
                    value={africastalkingSettings.shortcode}
                    onChange={(e) => setAfricastalkingSettings({...africastalkingSettings, shortcode: e.target.value})}
                    placeholder="Enter shortcode"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Twilio Settings */}
          {smsProvider === 'twilio' && (
            <div className="space-y-4 bg-[#FAF4EC] rounded-xl p-6 border border-[#36454F]/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6B7F39] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-[#36454F]">Twilio Settings</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Shield className="w-4 h-4 text-[#6B7F39]" />
                    Account SID
                  </label>
                  <Input
                    value={twilioSettings.accountSid}
                    onChange={(e) => setTwilioSettings({...twilioSettings, accountSid: e.target.value})}
                    placeholder="Enter Account SID"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Shield className="w-4 h-4 text-[#6B7F39]" />
                    Auth Token
                  </label>
                  <Input
                    type="password"
                    value={twilioSettings.authToken}
                    onChange={(e) => setTwilioSettings({...twilioSettings, authToken: e.target.value})}
                    placeholder="Enter Auth Token"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Phone className="w-4 h-4 text-[#6B7F39]" />
                    Phone Number
                  </label>
                  <Input
                    value={twilioSettings.phoneNumber}
                    onChange={(e) => setTwilioSettings({...twilioSettings, phoneNumber: e.target.value})}
                    placeholder="+1234567890"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* WhatsApp Tab Content */}
      {activeTab === 'whatsapp' && (
        <>
          <div className="space-y-4 bg-[#FAF4EC] rounded-xl p-6 border border-[#36454F]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-[#36454F]">WhatsApp Settings (wasenderapi.com)</h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappSettings.enabled}
                  onChange={(e) => setWhatsappSettings({...whatsappSettings, enabled: e.target.checked})}
                  className="w-5 h-5 text-[#6B7F39] border-gray-300 rounded focus:ring-[#6B7F39]"
                />
                <span className="text-sm font-semibold text-[#36454F]">Enable WhatsApp</span>
              </label>
            </div>

            {whatsappSettings.enabled && (
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Key className="w-4 h-4 text-[#6B7F39]" />
                    API Key
                  </label>
                  <Input
                    type="password"
                    value={whatsappSettings.apiKey}
                    onChange={(e) => setWhatsappSettings({...whatsappSettings, apiKey: e.target.value})}
                    placeholder="Enter wasenderapi.com API key"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Globe className="w-4 h-4 text-[#6B7F39]" />
                    API URL
                  </label>
                  <Input
                    value={whatsappSettings.apiUrl}
                    onChange={(e) => setWhatsappSettings({...whatsappSettings, apiUrl: e.target.value})}
                    placeholder="https://api.wasenderapi.com"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Phone className="w-4 h-4 text-[#6B7F39]" />
                    Admin WhatsApp Number (to receive notifications)
                  </label>
                  <Input
                    value={whatsappSettings.adminPhone}
                    onChange={(e) => setWhatsappSettings({...whatsappSettings, adminPhone: e.target.value})}
                    placeholder="+254700123456"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                  <p className="text-xs text-gray-600">Format: +254XXXXXXXXX (include country code)</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Email Tab Content */}
      {activeTab === 'email' && (
        <>
          <div className="space-y-4 bg-[#FAF4EC] rounded-xl p-6 border border-[#36454F]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6B7F39] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-[#36454F]">Email Settings</h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailSettings.enabled}
                  onChange={(e) => setEmailSettings({...emailSettings, enabled: e.target.checked})}
                  className="w-5 h-5 text-[#6B7F39] border-gray-300 rounded focus:ring-[#6B7F39]"
                />
                <span className="text-sm font-semibold text-[#36454F]">Enable Email</span>
              </label>
            </div>

            {emailSettings.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Globe className="w-4 h-4 text-[#6B7F39]" />
                    SMTP Host
                  </label>
                  <Input
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                    placeholder="smtp.gmail.com"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Shield className="w-4 h-4 text-[#6B7F39]" />
                    SMTP Port
                  </label>
                  <Input
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                    placeholder="587"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <UserCog className="w-4 h-4 text-[#6B7F39]" />
                    SMTP Username
                  </label>
                  <Input
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                    placeholder="your-email@gmail.com"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Key className="w-4 h-4 text-[#6B7F39]" />
                    SMTP Password
                  </label>
                  <Input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                    placeholder="Enter SMTP password"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Mail className="w-4 h-4 text-[#6B7F39]" />
                    From Email
                  </label>
                  <Input
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                    placeholder="noreply@skywaysuites.co.ke"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <UserCog className="w-4 h-4 text-[#6B7F39]" />
                    From Name
                  </label>
                  <Input
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                    placeholder="Skyway Suites"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                    <Mail className="w-4 h-4 text-[#6B7F39]" />
                    Admin Email (to receive notifications)
                  </label>
                  <Input
                    value={emailSettings.adminEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, adminEmail: e.target.value})}
                    placeholder="admin@skywaysuites.co.ke"
                    className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="pt-4 border-t border-[#36454F]/10">
        <Button 
          onClick={onSave}
          className="w-full md:w-auto bg-[#6B7F39] hover:bg-[#5a6930] text-white font-semibold py-6 px-8 rounded-xl shadow-lg"
          disabled={!isOnline}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Save Notification Settings
        </Button>
      </div>
    </>
  );
}
