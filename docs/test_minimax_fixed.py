# MiniMax API 测试 - 修正版
import requests

API_KEY = "sk-api-dHMfMag2uo0ABRFywU-9as39u_ns_QQRtC-GolSaQED1Z3i8H-tknbEqFWwXKJjYa-iQkaTszbXrycNYN1J_9kU60ZOKk7TygtR8tmjLJ71vgU5nDOnYTIc"
BASE_URL = "https://api.minimaxi.com/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

print("=== MiniMax API 验证（修正版）===\n")

# 测试 TTS（修正字段名）
print("测试 TTS 语音合成...")
try:
    url = f"{BASE_URL}/t2a_v2"
    payload = {
        "model": "speech-01-turbo",
        "text": "你好，我是时光手记的 AI 采访助手。很高兴能陪你一起记录人生故事。",
        "stream": False,
        "voice_setting": {
            "voice_id": "male-qn-qingse",
            "speed": 1.0,
            "vol": 1.0,
            "pitch": 0
        },
        "audio_setting": {
            "sample_rate": 32000,
            "bitrate": 128000,
            "format": "mp3"
        }
    }
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    result = response.json()
    
    print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)[:500]}")
    
    # 正确的字段路径: data.audio
    if result.get("data") and result["data"].get("audio"):
        audio_hex = result["data"]["audio"]
        audio_data = bytes.fromhex(audio_hex)
        with open("test_tts.mp3", "wb") as f:
            f.write(audio_data)
        print(f"✓ TTS 成功！音频已保存到 test_tts.mp3 ({len(audio_data)} bytes)")
    else:
        error_msg = result.get('base_resp', {}).get('status_msg', '未知错误')
        print(f"✗ TTS 失败: {error_msg}")
        print(f"完整响应: {result}")
except Exception as e:
    print(f"✗ 错误: {e}")
    import traceback
    traceback.print_exc()
