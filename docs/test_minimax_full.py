#!/usr/bin/env python3
"""
MiniMax API 完整能力验证脚本
测试内容：文字对话、TTS语音合成、图片理解
"""

import requests
import json
import base64
import os

API_KEY = "sk-api-dHMfMag2uo0ABRFywU-9as39u_ns_QQRtC-GolSaQED1Z3i8H-tknbEqFWwXKJjYa-iQkaTszbXrycNYN1J_9kU60ZOKk7TygtR8tmjLJ71vgU5nDOnYTIc"
BASE_URL = "https://api.minimaxi.com/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

results = {}

def test_chat():
    """测试基础文字对话"""
    print("=== 测试 1: 基础文字对话 ===")
    
    url = f"{BASE_URL}/text/chatcompletion_v2"
    payload = {
        "model": "abab6.5s-chat",
        "messages": [
            {"role": "system", "content": "你是一个专业的传记采访者。"},
            {"role": "user", "content": "你好，我想为我父亲写一本传记，他今年70岁了。"}
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        result = response.json()
        
        if response.status_code == 200 and result.get("choices"):
            content = result["choices"][0]["message"]["content"]
            print(f"✅ 成功")
            print(f"   回复: {content[:100]}...")
            return True
        else:
            print(f"❌ 失败: {result}")
            return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def test_tts():
    """测试语音合成 TTS"""
    print("\n=== 测试 2: TTS 语音合成 ===")
    
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
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        result = response.json()
        
        # 正确的字段路径: data.audio
        if result.get("data") and result["data"].get("audio"):
            audio_hex = result["data"]["audio"]
            audio_data = bytes.fromhex(audio_hex)
            
            # 保存音频
            output_path = "test_output.mp3"
            with open(output_path, "wb") as f:
                f.write(audio_data)
            
            # 获取额外信息
            extra = result.get("extra_info", {})
            print(f"✅ 成功")
            print(f"   音频文件: {output_path}")
            print(f"   大小: {len(audio_data)} bytes ({extra.get('audio_size', 'N/A')})")
            print(f"   时长: {extra.get('audio_length', 'N/A')}ms")
            print(f"   字符数: {extra.get('usage_characters', 'N/A')}")
            return True
        else:
            error_msg = result.get('base_resp', {}).get('status_msg', '未知错误')
            print(f"❌ 失败: {error_msg}")
            print(f"   完整响应: {json.dumps(result, indent=2)[:300]}")
            return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_vision_with_url():
    """测试图片理解能力（使用图片 URL）"""
    print("\n=== 测试 3: 图片理解（URL 模式） ===")
    
    url = f"{BASE_URL}/text/chatcompletion_v2"
    
    # 使用一个示例图片 URL
    image_url = "https://picsum.photos/400/300"
    
    payload = {
        "model": "abab6.5s-chat",  # 需要确认是否支持多模态
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "描述这张图片，如果里面有人的话，告诉我他们在做什么。"},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        result = response.json()
        
        if response.status_code == 200 and result.get("choices"):
            content = result["choices"][0]["message"]["content"]
            print(f"✅ 成功")
            print(f"   描述: {content[:150]}...")
            return True
        else:
            # 可能模型不支持多模态，记录但不视为失败
            status_msg = result.get('base_resp', {}).get('status_msg', '')
            print(f"⚠️  可能不支持多模态或图片 URL 模式")
            print(f"   错误: {status_msg}")
            print(f"   响应: {json.dumps(result, indent=2)[:200]}")
            return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def test_vision_with_base64():
    """测试图片理解能力（使用 base64）"""
    print("\n=== 测试 4: 图片理解（Base64 模式） ===")
    
    # 先下载一张测试图片并转为 base64
    try:
        # 使用一张简单的测试图片
        img_response = requests.get("https://picsum.photos/200/150", timeout=10)
        if img_response.status_code == 200:
            image_base64 = base64.b64encode(img_response.content).decode('utf-8')
            
            url = f"{BASE_URL}/text/chatcompletion_v2"
            payload = {
                "model": "abab6.5s-chat",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "简单描述这张图片的内容。"},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                        ]
                    }
                ]
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            result = response.json()
            
            if response.status_code == 200 and result.get("choices"):
                content = result["choices"][0]["message"]["content"]
                print(f"✅ 成功")
                print(f"   描述: {content[:150]}...")
                return True
            else:
                status_msg = result.get('base_resp', {}).get('status_msg', '')
                print(f"⚠️  模型可能不支持图片理解")
                print(f"   状态: {status_msg}")
                return False
        else:
            print(f"⚠️  无法下载测试图片")
            return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def test_roleplay():
    """测试角色扮演能力（传记采访者）"""
    print("\n=== 测试 5: 角色扮演（传记采访者） ===")
    
    url = f"{BASE_URL}/text/chatcompletion_v2"
    
    system_prompt = """你是一位经验丰富的传记采访者，擅长：
1. 用温和的语气引导受访者打开心扉
2. 从具体细节入手，逐步深入到情感和意义
3. 善于追问，但不让人感到被审问

你现在要采访一位老人，聊聊他的大学时光。请用自然、口语化的中文进行对话。"""

    payload = {
        "model": "abab6.5s-chat",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "你好，我想聊聊我的大学时光。我是1975年上的大学。"}
        ],
        "temperature": 0.7
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        result = response.json()
        
        if response.status_code == 200 and result.get("choices"):
            content = result["choices"][0]["message"]["content"]
            print(f"✅ 成功")
            print(f"   AI回复: {content}")
            return True
        else:
            print(f"❌ 失败: {result}")
            return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

if __name__ == "__main__":
    print("🚀 MiniMax API 完整能力验证\n")
    print("=" * 50)
    
    results["文字对话"] = test_chat()
    results["TTS语音"] = test_tts()
    results["图片理解(URL)"] = test_vision_with_url()
    results["图片理解(Base64)"] = test_vision_with_base64()
    results["角色扮演"] = test_roleplay()
    
    print("\n" + "=" * 50)
    print("📊 验证结果汇总:")
    for name, passed in results.items():
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"   {name}: {status}")
    
    passed_count = sum(results.values())
    total_count = len(results)
    
    print("=" * 50)
    if passed_count == total_count:
        print(f"🎉 全部通过！({passed_count}/{total_count})")
    else:
        print(f"⚠️  {passed_count}/{total_count} 项通过，部分功能需进一步验证")
    
    # 如果 TTS 成功了，提示用户
    if results.get("TTS语音"):
        print(f"\n🎵 TTS 测试音频已保存为: test_output.mp3")
