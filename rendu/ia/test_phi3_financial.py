import requests
import time
import os

# Configuration - À ajuster par l'équipe INFRA si nécessaire
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "phi3.5-financial"

QUESTIONS = [
    "Quelles sont les implications d'une hausse des taux d'intérêt par la banque centrale ?",
    "Explique-moi la différence entre une action et une obligation.",
    "Comment analyser le bilan financier d'une entreprise ?",
    "Qu'est-ce que le ratio de liquidité générale et pourquoi est-il important ?",
    "Quelles sont les stratégies courantes pour couvrir le risque de change ?",
    "Comment évaluer la valorisation d'une startup technologique ?",
    "Quels sont les impacts de l'inflation sur les rendements obligataires ?",
    "Explique le concept de 'Value at Risk' (VaR) en finance de marché.",
    "Quels sont les avantages et les risques des fonds indiciels (ETF) ?",
    "Comment interpréter la courbe des taux inversée ?"
]

def generate_report(results, total_duration, success_count):
    avg_time = total_duration / len(QUESTIONS) if QUESTIONS else 0
    
    report = f"""# Évaluation du modèle {MODEL_NAME} en Production

## 1. Contexte
Ce rapport présente l'évaluation automatique du modèle `{MODEL_NAME}` déployé en local. Les tests ont été effectués en soumettant une série de {len(QUESTIONS)} questions financières au serveur d'inférence.

## 2. Performance Technique
- **Requêtes réussies :** {success_count} / {len(QUESTIONS)}
- **Temps de réponse total :** {total_duration:.2f} secondes
- **Temps de réponse moyen :** {avg_time:.2f} secondes par question

## 3. Détail des Questions et Réponses générées

"""
    for i, res in enumerate(results, 1):
        report += f"### Question {i} : {res['question']}\n"
        report += f"**Temps de réponse :** {res['temps_reponse_secondes']:.2f}s\n\n"
        report += f"**Réponse :**\n{res['reponse']}\n\n"
        report += "---\n\n"
        
    report += """## 4. Analyse de la Fiabilité et des Hallucinations
*Section à compléter manuellement par l'équipe IA suite à la lecture des réponses ci-dessus.*
- **Précision :** [Évaluer si les réponses financières sont correctes]
- **Hallucinations :** [Noter s'il y a des hallucinations]
- **Recommandation :** [Le modèle est-il prêt pour la production ?]
"""
    return report

def test_model():
    print(f"Début du test en production pour le modèle : {MODEL_NAME}")
    print("-" * 50)
    
    results = []
    total_duration = 0
    success_count = 0
    
    for i, question in enumerate(QUESTIONS, 1):
        print(f"\n[Question {i}/{len(QUESTIONS)}] : {question}")
        
        payload = {
            "model": MODEL_NAME,
            "prompt": question,
            "stream": False
        }
        
        start_time = time.time()
        try:
            response = requests.post(OLLAMA_URL, json=payload, timeout=120)
            response.raise_for_status()
            data = response.json()
            answer = data.get("response", "Pas de réponse.")
            duration = time.time() - start_time
            
            print(f"-> Réponse reçue en {duration:.2f}s")
            
            results.append({
                "question": question,
                "reponse": answer,
                "temps_reponse_secondes": duration,
                "succes": True
            })
            total_duration += duration
            success_count += 1
            
        except requests.exceptions.RequestException as e:
            print(f"-> Erreur lors de la requête : {e}")
            results.append({
                "question": question,
                "reponse": f"*Erreur d'inférence : {str(e)}*",
                "temps_reponse_secondes": 0,
                "succes": False
            })

    # Génération et sauvegarde du rapport markdown
    report_content = generate_report(results, total_duration, success_count)
    output_file = os.path.join(os.path.dirname(__file__), "evaluation_phi3.md")
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(report_content)
        
    print("\n" + "-" * 50)
    print(f"Test terminé. Le rapport complet a été généré dans '{output_file}'.")

if __name__ == "__main__":
    test_model()
