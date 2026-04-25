import type { Server as HttpServer } from 'http';

import { Server } from 'socket.io';

export function buildSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('interview:join', (roomId: string) => {
      socket.join(roomId);
    });
    socket.on('interview:code-change', (payload: { roomId: string; code: string }) => {
      socket.to(payload.roomId).emit('interview:code-change', payload);
    });
    socket.on('interview:cursor-move', (payload: { roomId: string; userId: string; line: number; column: number }) => {
      socket.to(payload.roomId).emit('interview:cursor-move', payload);
    });
    socket.on('interview:chat-message', (payload: { roomId: string; userId: string; message: string }) => {
      io.to(payload.roomId).emit('interview:chat-message', payload);
    });
    socket.on('interview:end', (payload: { roomId: string; interviewId: string }) => {
      io.to(payload.roomId).emit('interview:end', payload);
    });

    socket.on('hackathon:join', (roomId: string) => {
      socket.join(roomId);
    });
    socket.on('hackathon:submission', (payload: { roomId: string; status: string; score: number }) => {
      io.to(payload.roomId).emit('hackathon:submission', payload);
    });
    socket.on('hackathon:leaderboard', (payload: { roomId: string; entries: unknown[] }) => {
      io.to(payload.roomId).emit('hackathon:leaderboard', payload);
    });
    socket.on('hackathon:timer', (payload: { roomId: string; secondsRemaining: number }) => {
      io.to(payload.roomId).emit('hackathon:timer', payload);
    });
  });

  return io;
}
