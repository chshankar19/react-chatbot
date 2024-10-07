from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Quantization and model loading
model_name = "EleutherAI/gpt-neo-1.3B"
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Load and quantize the model if not already quantized
try:
    model = AutoModelForCausalLM.from_pretrained("./quantized_gpt_neo")
    print("Loaded quantized model.")
except:
    print("Quantizing the model...")
    model = AutoModelForCausalLM.from_pretrained(model_name)
    model = torch.quantization.quantize_dynamic(
        model, {torch.nn.Linear}, dtype=torch.qint8
    )
    model.save_pretrained("./quantized_gpt_neo")
    print("Quantized model saved.")

def generate_response(prompt):
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(
        **inputs,
        max_length=150,
        do_sample=True,
        temperature=0.9,
        top_k=50,
        top_p=0.95,
        no_repeat_ngram_size=2
    )
    response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response_text

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    prompt = data.get('prompt')
    if prompt:
        response = generate_response(prompt)
        return jsonify({'response': response})
    return jsonify({'response': 'No prompt provided'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
