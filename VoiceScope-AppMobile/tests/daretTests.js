/**
 * 🧪 Tests d'intégration - Daret
 * 
 * Fichier pour vérifier que tout est bien intégré
 * À exécuter dans la console React Native Debugger
 */

import { useDaret } from './src/context/DaretContext';
import {
    calculateRoundTotal,
    formatDateFR,
    getDaysUntilDue,
    isOverdue,
    validateDaretData,
} from './src/utils/daretHelpers';

/**
 * Suite de tests pour vérifier l'intégrité du système
 */
export class DaretTestSuite {
  /**
   * Test 1: Vérifier que le hook fonctionne
   */
  static testHookAvailability() {
    console.log('🧪 Test 1: Disponibilité du hook');
    try {
      const { darets } = useDaret();
      console.log('✅ Hook disponible');
      return true;
    } catch (error) {
      console.error('❌ Hook non disponible:', error.message);
      return false;
    }
  }

  /**
   * Test 2: Vérifier les helpers
   */
  static testHelpers() {
    console.log('\n🧪 Test 2: Disponibilité des helpers');
    const tests = [
      { name: 'formatDateFR', fn: () => formatDateFR(new Date()) },
      { name: 'calculateRoundTotal', fn: () => calculateRoundTotal(500, 5) },
      { name: 'isOverdue', fn: () => isOverdue(new Date()) },
      { name: 'getDaysUntilDue', fn: () => getDaysUntilDue(new Date()) },
      { name: 'validateDaretData', fn: () => validateDaretData({ name: 'Test' }) },
    ];

    let passed = 0;
    tests.forEach(test => {
      try {
        test.fn();
        console.log(`  ✅ ${test.name}`);
        passed++;
      } catch (error) {
        console.error(`  ❌ ${test.name}: ${error.message}`);
      }
    });

    console.log(`Résultat: ${passed}/${tests.length} helpers fonctionnels`);
    return passed === tests.length;
  }

  /**
   * Test 3: Vérifier la création de Daret
   */
  static async testDaretCreation() {
    console.log('\n🧪 Test 3: Création de Daret');
    try {
      const { createDaret } = useDaret();
      
      const testDaret = await createDaret({
        name: 'Test Daret',
        monthlyAmount: 500,
        members: [
          { name: 'Test Member 1' },
          { name: 'Test Member 2' },
        ]
      });

      if (testDaret && testDaret.id) {
        console.log(`✅ Daret créée: ${testDaret.id}`);
        return testDaret;
      } else {
        console.error('❌ Daret mal créée');
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur création:', error.message);
      return null;
    }
  }

  /**
   * Test 4: Vérifier la récupération
   */
  static testDaretRetrieval(daretId) {
    console.log('\n🧪 Test 4: Récupération de Daret');
    try {
      const { getDaretById } = useDaret();
      const daret = getDaretById(daretId);

      if (daret) {
        console.log(`✅ Daret trouvée: ${daret.name}`);
        console.log(`  - ID: ${daret.id}`);
        console.log(`  - Membres: ${daret.members.length}`);
        console.log(`  - Montant: ${daret.monthlyAmount} DH`);
        return true;
      } else {
        console.error('❌ Daret non trouvée');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur récupération:', error.message);
      return false;
    }
  }

  /**
   * Test 5: Vérifier les statistiques
   */
  static testDaretStats(daretId) {
    console.log('\n🧪 Test 5: Statistiques');
    try {
      const { getDaretStats } = useDaret();
      const stats = getDaretStats(daretId);

      if (stats) {
        console.log(`✅ Stats disponibles`);
        console.log(`  - Total versé: ${stats.totalContributed} DH`);
        console.log(`  - Tours complétés: ${stats.totalRoundsCompleted}`);
        console.log(`  - Membres: ${Object.keys(stats.memberStats).length}`);
        return true;
      } else {
        console.error('❌ Stats non disponibles');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur stats:', error.message);
      return false;
    }
  }

  /**
   * Test 6: Vérifier le stockage
   */
  static async testStorage(daretId) {
    console.log('\n🧪 Test 6: Stockage AsyncStorage');
    try {
      const { darets } = useDaret();
      
      if (darets && Array.isArray(darets)) {
        const found = darets.find(d => d.id === daretId);
        if (found) {
          console.log(`✅ Daret trouvée en stockage`);
          console.log(`  - Total darets: ${darets.length}`);
          console.log(`  - Daret persistent: OUI`);
          return true;
        } else {
          console.error('❌ Daret non trouvée en stockage');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Erreur stockage:', error.message);
      return false;
    }
  }

  /**
   * Test 7: Vérifier la validation
   */
  static testValidation() {
    console.log('\n🧪 Test 7: Validation');

    const validTests = [
      {
        name: 'Daret valide',
        data: {
          name: 'Valid Daret',
          monthlyAmount: 500,
          members: [{ name: 'A' }, { name: 'B' }]
        },
        shouldPass: true
      },
      {
        name: 'Montant 0',
        data: {
          name: 'Invalid',
          monthlyAmount: 0,
          members: [{ name: 'A' }]
        },
        shouldPass: false
      },
      {
        name: 'Pas assez de membres',
        data: {
          name: 'Invalid',
          monthlyAmount: 500,
          members: [{ name: 'A' }]
        },
        shouldPass: false
      },
    ];

    let passed = 0;
    validTests.forEach(test => {
      const result = validateDaretData(test.data);
      const testPassed = result.isValid === test.shouldPass;

      if (testPassed) {
        console.log(`  ✅ ${test.name}`);
        passed++;
      } else {
        console.error(`  ❌ ${test.name}`);
        console.error(`     Attendu: ${test.shouldPass}, Reçu: ${result.isValid}`);
      }
    });

    console.log(`Résultat: ${passed}/${validTests.length} validations OK`);
    return passed === validTests.length;
  }

  /**
   * Test 8: Vérifier les membres
   */
  static async testMembers(daretId) {
    console.log('\n🧪 Test 8: Gestion des membres');
    try {
      const { getDaretById, addMemberToDaret, removeMemberFromDaret } = useDaret();
      
      let daret = getDaretById(daretId);
      const initialCount = daret.members.length;

      // Ajouter
      await addMemberToDaret(daretId, { name: 'Test New Member' });
      daret = getDaretById(daretId);
      const addedCount = daret.members.length;

      if (addedCount === initialCount + 1) {
        console.log(`✅ Membre ajouté`);
      } else {
        console.error(`❌ Membre non ajouté`);
        return false;
      }

      // Retirer
      const memberToRemove = daret.members[0];
      await removeMemberFromDaret(daretId, memberToRemove.id);
      daret = getDaretById(daretId);
      const removedCount = daret.members.length;

      if (removedCount === addedCount - 1) {
        console.log(`✅ Membre retiré`);
        console.log(`  - Membres actuel: ${removedCount}`);
        return true;
      } else {
        console.error(`❌ Membre non retiré`);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur gestion membres:', error.message);
      return false;
    }
  }

  /**
   * Test 9: Vérifier les tours
   */
  static async testRounds(daretId) {
    console.log('\n🧪 Test 9: Gestion des tours');
    try {
      const { getDaretById, completeDaretRound } = useDaret();
      
      let daret = getDaretById(daretId);
      const initialRounds = daret.roundHistory.length;
      const initialIndex = daret.currentRoundIndex;

      // Compléter un tour
      await completeDaretRound(daretId);
      daret = getDaretById(daretId);
      const newRounds = daret.roundHistory.length;
      const newIndex = daret.currentRoundIndex;

      if (newRounds === initialRounds + 1) {
        console.log(`✅ Tour enregistré`);
        console.log(`  - Tours total: ${newRounds}`);
        console.log(`  - Index: ${initialIndex} → ${newIndex}`);
        
        // Vérifier que la rotation a changé
        if (daret.members.length > 1 && newIndex !== initialIndex) {
          console.log(`✅ Rotation correcte`);
          return true;
        } else if (daret.members.length === 1) {
          console.log(`ℹ️ Un seul membre, pas de rotation`);
          return true;
        }
      } else {
        console.error(`❌ Tour non enregistré`);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur gestion tours:', error.message);
      return false;
    }
  }

  /**
   * Test 10: Vérifier pause/reprise
   */
  static async testPauseResume(daretId) {
    console.log('\n🧪 Test 10: Pause/Reprise');
    try {
      const { getDaretById, pauseDaret, resumeDaret } = useDaret();
      
      // Pauser
      await pauseDaret(daretId);
      let daret = getDaretById(daretId);
      
      if (daret.status === 'paused') {
        console.log(`✅ Daret pausée`);
      } else {
        console.error(`❌ Pause échouée`);
        return false;
      }

      // Reprendre
      await resumeDaret(daretId);
      daret = getDaretById(daretId);
      
      if (daret.status === 'active') {
        console.log(`✅ Daret reprise`);
        return true;
      } else {
        console.error(`❌ Reprise échouée`);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur pause/reprise:', error.message);
      return false;
    }
  }

  /**
   * Exécuter tous les tests
   */
  static async runAll() {
    console.log('═══════════════════════════════════════');
    console.log('🚀 SUITE DE TESTS COMPLÈTE - DARET');
    console.log('═══════════════════════════════════════\n');

    const results = {
      hook: false,
      helpers: false,
      creation: null,
      retrieval: false,
      stats: false,
      storage: false,
      validation: false,
      members: false,
      rounds: false,
      pauseResume: false,
    };

    // Tester les basiques
    results.hook = this.testHookAvailability();
    results.helpers = this.testHelpers();
    results.validation = this.testValidation();

    // Tester la création
    const createdDaret = await this.testDaretCreation();
    if (createdDaret) {
      results.creation = createdDaret.id;
      results.retrieval = this.testDaretRetrieval(createdDaret.id);
      results.stats = this.testDaretStats(createdDaret.id);
      results.storage = await this.testStorage(createdDaret.id);
      results.members = await this.testMembers(createdDaret.id);
      results.rounds = await this.testRounds(createdDaret.id);
      results.pauseResume = await this.testPauseResume(createdDaret.id);
    }

    // Résumé
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('═══════════════════════════════════════\n');

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r === true || (typeof r === 'string' && r.length > 0)).length;

    Object.entries(results).forEach(([test, result]) => {
      const status = result === true || (typeof result === 'string' && result.length > 0) ? '✅' : '❌';
      console.log(`${status} ${test}: ${result === true ? 'PASS' : result === false ? 'FAIL' : 'OK'}`);
    });

    console.log('\n═══════════════════════════════════════');
    console.log(`TOTAL: ${passedTests}/${totalTests} tests réussis`);
    console.log('═══════════════════════════════════════\n');

    if (passedTests === totalTests) {
      console.log('🎉 TOUS LES TESTS RÉUSSIS! La Daret est prête!\n');
      return true;
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.\n');
      return false;
    }
  }
}

// ============================================
// EXÉCUTION RAPIDE
// ============================================

/**
 * Pour exécuter les tests:
 * 
 * 1. Dans la console du Debugger:
 *    import { DaretTestSuite } from './tests/daretTests';
 *    await DaretTestSuite.runAll();
 * 
 * 2. Ou lancer des tests spécifiques:
 *    DaretTestSuite.testHookAvailability();
 *    DaretTestSuite.testHelpers();
 *    etc...
 */

export default DaretTestSuite;
