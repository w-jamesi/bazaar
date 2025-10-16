import { Shield, Lock, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';

const PrivacyFeature = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            完全同态加密保护隐私
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            使用 FHE 技术，您的财务信息在整个借贷过程中始终保持加密状态
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">端到端加密</h3>
            <p className="text-muted-foreground leading-relaxed">
              借款金额和个人信息在传输和存储过程中始终保持加密状态，任何人都无法查看明文数据。
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">加密计算</h3>
            <p className="text-muted-foreground leading-relaxed">
              利用 FHE 同态加密技术，智能合约可以在不解密数据的情况下进行计算和验证。
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">隐私保障</h3>
            <p className="text-muted-foreground leading-relaxed">
              即使是平台管理员也无法查看您的借款详情，真正实现数据自主权和隐私保护。
            </p>
          </Card>
        </div>

        <div className="mt-16 p-8 bg-muted rounded-2xl">
          <h3 className="text-2xl font-bold mb-4 text-center text-foreground">
            FHE 同态加密工作原理
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <p className="text-sm text-muted-foreground">提交借款申请</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <p className="text-sm text-muted-foreground">本地加密数据</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <p className="text-sm text-muted-foreground">链上加密计算</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <p className="text-sm text-muted-foreground">安全完成交易</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyFeature;
