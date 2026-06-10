import { useEffect, useState } from 'react';
import { Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { joinService } from '../../services/join.service';
import CustomerJoinModal from '../../components/join/CustomerJoinModal';
import OrganisationJoinModal from '../../components/join/OrganisationJoinModal';
import { ServifyLogoMark } from '../../components/auth/AuthLogo';
import { LINKS } from '../../lib/links';

interface Organisation {
  id:    string;
  name:  string;
  logo?: string;
}

export default function JoinPage() {
  const navigate = useNavigate();
  const [organisations, setOrganisations]     = useState<Organisation[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedOrg, setSelectedOrg]         = useState<Organisation | null>(null);
  const [customerModalOpen, setCustomerModal] = useState(false);
  const [orgModalOpen, setOrgModal]           = useState(false);

  useEffect(() => {
    joinService.getOrganisations()
      .then(setOrganisations)
      .finally(() => setLoading(false));
  }, []);

  const handleOrgClick = (org: Organisation) => {
    setSelectedOrg(org);
    setCustomerModal(true);
  };

  return (
    <div className="min-h-screen bg-form-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <ServifyLogoMark />
          <span className="text-lg font-bold text-primary">Servify</span>
        </div>
        <button
          onClick={() => navigate(LINKS.LOGIN)}
          className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
        >
          Already have an account? Sign in
        </button>
      </header>

      {/* Hero */}
      <div
        className="py-16 px-8 text-center"
        style={{ background: 'linear-gradient(180deg, rgba(101,16,127,0.04) 0%, rgba(255,255,255,0) 100%)' }}
      >
        <h1 className="text-4xl font-bold text-primary mb-3">
          Elevate Your Service Game:<br />Collaboration is key!
        </h1>
        <p className="text-text-muted text-base max-w-xl mx-auto">
          Boost customer satisfaction by harnessing collaboration to
          turn challenges into exceptional experiences.
        </p>
      </div>

      {/* Organisations */}
      <div className="max-w-5xl mx-auto px-8 pb-20">
        <h2 className="text-xl font-bold text-primary text-center mb-10">
          Trusted by companies like:
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : organisations.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            No organisations available yet
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 justify-items-center mb-16">
            {organisations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrgClick(org)}
                className="flex flex-col items-center gap-3 group"
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:shadow-lg transition-shadow"
                  style={{ background: 'rgba(101,16,127,1)' }}
                >
                  {org.name?.[0]}
                </div>
                <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                  {org.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">
            Join our million customers to share your experience.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => setOrgModal(true)}
            className="px-10 h-12 rounded-xl font-semibold"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Join us now
          </Button>
        </div>
      </div>

      {/* Modals */}
      <CustomerJoinModal
        open={customerModalOpen}
        organisation={selectedOrg}
        onClose={() => { setCustomerModal(false); setSelectedOrg(null); }}
      />
      <OrganisationJoinModal
        open={orgModalOpen}
        onClose={() => setOrgModal(false)}
      />
    </div>
  );
}
