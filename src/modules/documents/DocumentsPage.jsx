import { Card, PageHeader } from '../../components/ui.jsx';
import DocumentsPanel from './DocumentsPanel.jsx';

export default function DocumentsPage() {
  return (<><PageHeader title="Documents" sub="Your identity papers, certificates and letters from HR." /><Card><DocumentsPanel /></Card></>);
}
