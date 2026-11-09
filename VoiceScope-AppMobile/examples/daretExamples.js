/**
 * 📚 EXEMPLE D'INTÉGRATION COMPLÈTE
 * 
 * Ce fichier montre comment intégrer et utiliser la Daret
 * dans votre application React Native
 */

import { Alert } from 'react-native';
import { useDaret } from '../context/DaretContext';
import {
    formatCurrency,
    formatDateFR,
    generatePaymentReminders,
    getDaysUntilDue,
    getRotationOrder,
    isOverdue
} from '../utils/daretHelpers';

// ============================================
// EXEMPLE 1: Créer une Daret simple
// ============================================
export async function example1_CreateSimpleDaret() {
  const { createDaret } = useDaret();

  try {
    const newDaret = await createDaret({
      name: "Épargne Famille Bennani",
      monthlyAmount: 500,
      members: [
        { name: "Ahmed Bennani" },
        { name: "Fatima Bennani" },
        { name: "Hassan Bennani" },
      ]
    });

    console.log('✅ Daret créée:', newDaret);
    return newDaret;
  } catch (error) {
    console.error('❌ Erreur:', error);
    Alert.alert('Erreur', 'Impossible de créer la Daret');
  }
}

// ============================================
// EXEMPLE 2: Afficher toutes les darets et filtrer
// ============================================
export function example2_ListAndFilter() {
  const { darets, loading } = useDaret();

  if (loading) {
    return console.log('⏳ Chargement...');
  }

  // Toutes les darets
  console.log('📊 Total de darets:', darets.length);

  // Darets actives
  const activeDarets = darets.filter(d => d.status === 'active');
  console.log('🟢 Darets actives:', activeDarets.length);

  // Darets avec retard
  const overdued = darets.filter(d => isOverdue(d.nextDueDate));
  console.log('⚠️ Darets en retard:', overdued.length);

  return darets;
}

// ============================================
// EXEMPLE 3: Récupérer les détails d'une Daret
// ============================================
export function example3_GetDaretDetails(daretId) {
  const { getDaretById, getDaretStats } = useDaret();

  const daret = getDaretById(daretId);
  if (!daret) {
    console.error('❌ Daret non trouvée');
    return;
  }

  console.log('📋 Daret:', daret.name);
  console.log('💰 Montant/mois:', daret.monthlyAmount, 'DH');
  console.log('👥 Membres:', daret.members.length);
  console.log('📅 Prochaine date:', formatDateFR(daret.nextDueDate));
  console.log('⏱️ Jours restants:', getDaysUntilDue(daret.nextDueDate));
  console.log('🟢 Statut:', daret.status);

  // Statistiques
  const stats = getDaretStats(daretId);
  console.log('📊 Statistiques:', stats);

  return { daret, stats };
}

// ============================================
// EXEMPLE 4: Enregistrer un paiement reçu
// ============================================
export async function example4_CompleteRound(daretId) {
  const { completeDaretRound, getDaretById, getDaretStats } = useDaret();

  const daret = getDaretById(daretId);
  const recipient = daret.members[daret.currentRoundIndex];

  console.log(`💳 Enregistrement du paiement pour ${recipient.name}...`);

  try {
    await completeDaretRound(daretId);
    console.log('✅ Paiement enregistré');

    const updatedDaret = getDaretById(daretId);
    const nextRecipient = updatedDaret.members[updatedDaret.currentRoundIndex];
    console.log(`🔄 Prochain bénéficiaire: ${nextRecipient.name}`);

    const stats = getDaretStats(daretId);
    console.log(`📊 Tours complétés: ${stats.totalRoundsCompleted}/${daret.totalCycles}`);

    return true;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

// ============================================
// EXEMPLE 5: Gérer les membres
// ============================================
export async function example5_ManageMembers(daretId) {
  const { addMemberToDaret, removeMemberFromDaret, getDaretById } = useDaret();

  // Ajouter un membre
  console.log('➕ Ajout d\'un membre...');
  await addMemberToDaret(daretId, { name: "Zainab Bennani" });
  console.log('✅ Membre ajouté');

  // Afficher les membres
  let daret = getDaretById(daretId);
  console.log('👥 Membres actuels:', daret.members.map(m => m.name));

  // Retirer un membre
  const memberToRemove = daret.members[0];
  console.log('❌ Retrait d\'un membre...');
  await removeMemberFromDaret(daretId, memberToRemove.id);
  console.log('✅ Membre retiré');

  // Vérifier
  daret = getDaretById(daretId);
  console.log('👥 Nouveaux membres:', daret.members.map(m => m.name));
}

// ============================================
// EXEMPLE 6: Calculer les statistiques
// ============================================
export function example6_CalculateStats(daretId) {
  const { getDaretById, getDaretStats } = useDaret();

  const daret = getDaretById(daretId);
  const stats = getDaretStats(daretId);

  console.log('═══════════════════════════════════════');
  console.log('📊 STATISTIQUES DE LA DARET');
  console.log('═══════════════════════════════════════');

  // Total
  console.log(`\n💰 FINANCES`);
  console.log(`  Total versé: ${formatCurrency(stats.totalContributed)}`);
  console.log(`  Montant par tour: ${formatCurrency(daret.monthlyAmount * daret.members.length)}`);

  // Tours
  console.log(`\n📅 TOURS`);
  console.log(`  Complétés: ${stats.totalRoundsCompleted}`);
  console.log(`  Total prévus: ${daret.totalCycles}`);
  console.log(`  Progression: ${Math.round(stats.totalRoundsCompleted / daret.totalCycles * 100)}%`);

  // Membres
  console.log(`\n👥 MEMBRES`);
  Object.entries(stats.memberStats).forEach(([id, member]) => {
    const balance = member.totalReceived - member.totalContributed;
    const balanceText = balance > 0 ? `+${formatCurrency(balance)}` : formatCurrency(balance);
    console.log(`  ${member.name}`);
    console.log(`    - Versé: ${formatCurrency(member.totalContributed)}`);
    console.log(`    - Reçu: ${member.timesReceived}x (${formatCurrency(member.totalReceived)})`);
    console.log(`    - Solde: ${balanceText}`);
  });

  console.log('═══════════════════════════════════════\n');

  return stats;
}

// ============================================
// EXEMPLE 7: Générer des rappels
// ============================================
export function example7_GenerateReminders() {
  const { darets } = useDaret();
  
  console.log('📬 RAPPELS DE PAIEMENT');

  darets.forEach(daret => {
    if (daret.status !== 'active') return;

    const reminders = generatePaymentReminders(daret);
    
    if (reminders.length > 0) {
      console.log(`\n🔔 ${daret.name}:`);
      reminders.forEach(reminder => {
        const overdueText = reminder.daysOverdue < 0 
          ? ` (${Math.abs(reminder.daysOverdue)} jours de retard)`
          : '';
        console.log(`  - ${reminder.name}: ${reminder.message}${overdueText}`);
      });
    }
  });
}

// ============================================
// EXEMPLE 8: Afficher l'ordre de rotation
// ============================================
export function example8_ShowRotationOrder(daretId) {
  const { getDaretById } = useDaret();

  const daret = getDaretById(daretId);
  const order = getRotationOrder(daret.members, daret.currentRoundIndex);

  console.log(`\n🔄 ORDRE DE ROTATION - ${daret.name}`);
  console.log('════════════════════════════════════════');
  
  order.forEach(entry => {
    const isCurrent = entry.round === 1 ? ' 👈 ACTUEL' : '';
    console.log(`Tour #${entry.round}: ${entry.name}${isCurrent}`);
  });

  console.log('════════════════════════════════════════\n');

  return order;
}

// ============================================
// EXEMPLE 9: Pauser/Reprendre une Daret
// ============================================
export async function example9_PauseResume(daretId) {
  const { getDaretById, pauseDaret, resumeDaret } = useDaret();

  let daret = getDaretById(daretId);
  console.log(`Statut actuel: ${daret.status}`);

  if (daret.status === 'active') {
    console.log('⏸️ Pause de la Daret...');
    await pauseDaret(daretId);
  } else {
    console.log('▶️ Reprise de la Daret...');
    await resumeDaret(daretId);
  }

  daret = getDaretById(daretId);
  console.log(`✅ Nouveau statut: ${daret.status}`);
}

// ============================================
// EXEMPLE 10: Flux complet (scénario réaliste)
// ============================================
export async function example10_CompleteWorkflow() {
  const { 
    createDaret, 
    getDaretById, 
    getDaretStats,
    addMemberToDaret,
    completeDaretRound 
  } = useDaret();

  console.log('🚀 DÉMARRAGE DU FLUX COMPLET\n');

  // 1. Créer une Daret
  console.log('1️⃣ Création de la Daret...');
  const daret = await createDaret({
    name: "Daret Groupe Amis",
    monthlyAmount: 300,
    members: [
      { name: "Ali" },
      { name: "Nour" },
      { name: "Samir" },
    ]
  });
  console.log(`✅ Créée: ${daret.name} (ID: ${daret.id})\n`);

  // 2. Ajouter un membre
  console.log('2️⃣ Ajout d\'un membre...');
  await addMemberToDaret(daret.id, { name: "Yasmine" });
  console.log('✅ Membre ajouté\n');

  // 3. Afficher l\'ordre
  console.log('3️⃣ Ordre de rotation:');
  const rotationOrder = getRotationOrder(daret.members, 0);
  rotationOrder.forEach(r => console.log(`  - Tour ${r.round}: ${r.name}`));
  console.log();

  // 4. Effectuer plusieurs tours
  console.log('4️⃣ Exécution de 2 tours...');
  for (let i = 0; i < 2; i++) {
    const current = getDaretById(daret.id);
    const recipient = current.members[current.currentRoundIndex];
    console.log(`  Tour ${i + 1}: ${recipient.name} reçoit ${current.monthlyAmount * current.members.length} DH`);
    await completeDaretRound(daret.id);
    await new Promise(r => setTimeout(r, 500)); // Délai pour simulation
  }
  console.log('✅ Tours complétés\n');

  // 5. Afficher les statistiques
  console.log('5️⃣ Statistiques finales:');
  const stats = getDaretStats(daret.id);
  console.log(`  Total versé: ${formatCurrency(stats.totalContributed)}`);
  console.log(`  Tours complétés: ${stats.totalRoundsCompleted}`);
  
  Object.entries(stats.memberStats).forEach(([id, member]) => {
    console.log(`    - ${member.name}: ${formatCurrency(member.totalContributed)} versé, ${member.timesReceived}x reçu`);
  });

  console.log('\n✅ FLUX COMPLET TERMINÉ');
}

// ============================================
// EXPORTS
// ============================================
export const EXAMPLES = {
  'Créer une Daret': example1_CreateSimpleDaret,
  'Lister les darets': example2_ListAndFilter,
  'Détails d\'une Daret': example3_GetDaretDetails,
  'Enregistrer un paiement': example4_CompleteRound,
  'Gérer les membres': example5_ManageMembers,
  'Calculer les stats': example6_CalculateStats,
  'Générer des rappels': example7_GenerateReminders,
  'Voir l\'ordre': example8_ShowRotationOrder,
  'Pauser/Reprendre': example9_PauseResume,
  'Flux complet': example10_CompleteWorkflow,
};

// ============================================
// UTILISATION
// ============================================
/*
import { EXAMPLES } from '../examples/daretExamples';

// Exécuter un exemple
await EXAMPLES['Flux complet']();

// Ou avec paramètres
await EXAMPLES['Détails d\'une Daret']('daret_123');
*/
