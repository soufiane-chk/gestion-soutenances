import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { soutenancesAPI, etudiantsAPI, professeursAPI } from '../../services/api';
import { ArrowLeft, Save } from 'lucide-react';

const AddSoutenance = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [etudiants, setEtudiants] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_etudiant: '',
    date_soutenance: '',
    heure_soutenance: '',
    salle: '',
    status: 'planifiee',
    encadrant_id: '',
    rapporteur_id: '',
    examinateur_id: '',
    president_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [etudiantsRes, professeursRes] = await Promise.all([
          etudiantsAPI.getAll(),
          professeursAPI.getAll()
        ]);
        setEtudiants(etudiantsRes.data || []);
        setProfesseurs(professeursRes.data || []);

        if (id) {
          const soutenanceRes = await soutenancesAPI.getById(id);
          const soutenance = soutenanceRes.data;
          
          setFormData({
            id_etudiant: soutenance.id_etudiant || soutenance.etudiant_id || '',
            date_soutenance: soutenance.date_soutenance || '',
            heure_soutenance: soutenance.heure_soutenance || '',
            salle: soutenance.salle || '',
            status: soutenance.status || 'planifiee',
            encadrant_id: soutenance.jury?.encadrant_id || '',
            rapporteur_id: soutenance.jury?.rapporteur_id || '',
            examinateur_id: soutenance.jury?.examinateur_id || '',
            president_id: soutenance.jury?.president_id || '',
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await soutenancesAPI.update(id, formData);
      } else {
        await soutenancesAPI.create(formData);
      }
      navigate('/soutenances');
    } catch (error) {
      alert('Erreur lors de l\'enregistrement: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = etudiants.find(e => e.id == formData.id_etudiant);
  const recommendedProfs = selectedStudent 
    ? professeurs.filter(p => p.specialite === selectedStudent.filiere)
    : [];
  const otherProfs = selectedStudent
    ? professeurs.filter(p => p.specialite !== selectedStudent.filiere)
    : professeurs;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/soutenances')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 bg-white rounded-full shadow-sm hover:shadow transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          {id ? 'Modifier la soutenance' : 'Planifier une soutenance'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Étudiant</label>
              <select
                value={formData.id_etudiant}
                onChange={(e) => setFormData({ ...formData, id_etudiant: e.target.value })}
                required
                disabled={!!id} // Disable changing student in edit mode to avoid confusion or errors
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${id ? 'bg-gray-100' : ''}`}
              >
                <option value="">Sélectionner un étudiant</option>
                {etudiants.map((etudiant) => (
                  <option key={etudiant.id} value={etudiant.id}>
                    {etudiant.nom} {etudiant.prenom} - {etudiant.filiere}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de soutenance</label>
              <input
                type="date"
                value={formData.date_soutenance}
                onChange={(e) => setFormData({ ...formData, date_soutenance: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure de soutenance</label>
              <input
                type="time"
                value={formData.heure_soutenance}
                onChange={(e) => setFormData({ ...formData, heure_soutenance: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Salle</label>
              <input
                type="text"
                value={formData.salle}
                onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                required
                placeholder="Ex: Salle A101, Amphi 2..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="col-span-2 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Composition du Jury</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Encadrant</label>
                  <select
                    value={formData.encadrant_id}
                    onChange={(e) => setFormData({ ...formData, encadrant_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Sélectionner un encadrant</option>
                    {professeurs.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.user?.nom} - {prof.specialite}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rapporteur</label>
                  <select
                    value={formData.rapporteur_id}
                    onChange={(e) => setFormData({ ...formData, rapporteur_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Sélectionner un rapporteur</option>
                    {professeurs.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.user?.nom} - {prof.specialite}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Président</label>
                  <select
                    value={formData.president_id}
                    onChange={(e) => setFormData({ ...formData, president_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Sélectionner un président</option>
                    {recommendedProfs.length > 0 && (
                      <optgroup label="Recommandés (Spécialité correspondante)">
                        {recommendedProfs.map((prof) => (
                          <option key={prof.id} value={prof.id}>
                            {prof.user?.nom} - {prof.specialite}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Autres">
                      {otherProfs.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.user?.nom} - {prof.specialite}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Examinateur</label>
                  <select
                    value={formData.examinateur_id}
                    onChange={(e) => setFormData({ ...formData, examinateur_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Sélectionner un examinateur</option>
                    {recommendedProfs.length > 0 && (
                      <optgroup label="Recommandés (Spécialité correspondante)">
                        {recommendedProfs.map((prof) => (
                          <option key={prof.id} value={prof.id}>
                            {prof.user?.nom} - {prof.specialite}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Autres">
                      {otherProfs.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.user?.nom} - {prof.specialite}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Enregistrement...' : (id ? 'Modifier' : 'Planifier')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSoutenance;
