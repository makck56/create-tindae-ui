import { ref, onMounted } from 'vue';
import { setCaptchaAnswer } from '@/modules/auth';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const CAPTCHA_LENGTH = 4;
const CANVAS_WIDTH = 120;
const CANVAS_HEIGHT = 40;

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

function drawCaptcha(code: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // 背景
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 噪点
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
    ctx.beginPath();
    ctx.arc(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 1, 0, 2 * Math.PI);
    ctx.fill();
  }

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT);
    ctx.lineTo(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT);
    ctx.stroke();
  }

  // 字符
  const charWidth = CANVAS_WIDTH / (CAPTCHA_LENGTH + 1);
  for (let i = 0; i < code.length; i++) {
    ctx.save();
    ctx.font = `bold ${18 + Math.random() * 6}px Arial`;
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
    const x = charWidth * (i + 0.5);
    const y = CANVAS_HEIGHT / 2 + (Math.random() * 10 - 5);
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.4);
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

export function useCaptcha() {
  const captchaImage = ref('');

  function refresh() {
    const code = generateCode();
    setCaptchaAnswer(code);
    captchaImage.value = drawCaptcha(code);
  }

  onMounted(refresh);

  return { captchaImage, refresh };
}
