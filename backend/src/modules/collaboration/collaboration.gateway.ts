import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface JoinRecipePayload {
  recipeId: number;
  userId: number;
  username: string;
}

interface RecipeChangePayload extends JoinRecipePayload {
  field: string;
  value: string | number | null;
  clientEventId: string;
}

interface CursorPayload extends JoinRecipePayload {
  field: string;
  position: number;
}

interface PresencePayload {
  recipeId: number;
  userId: number;
  username: string;
  status: 'joined' | 'left';
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? '*',
    credentials: true,
  },
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly clientPresence = new Map<string, JoinRecipePayload>();

  handleConnection(_client: Socket): void {}

  handleDisconnect(client: Socket): void {
    const presence = this.clientPresence.get(client.id);
    if (!presence) {
      return;
    }
    const room = this.roomName(presence.recipeId);
    this.server.to(room).emit('presence', {
      ...presence,
      status: 'left',
    } satisfies PresencePayload);
    this.clientPresence.delete(client.id);
  }

  @SubscribeMessage('joinRecipe')
  async joinRecipe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRecipePayload,
  ): Promise<void> {
    const room = this.roomName(payload.recipeId);
    await client.join(room);
    this.clientPresence.set(client.id, payload);
    this.server.to(room).emit('presence', {
      ...payload,
      status: 'joined',
    } satisfies PresencePayload);
  }

  @SubscribeMessage('leaveRecipe')
  async leaveRecipe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRecipePayload,
  ): Promise<void> {
    const room = this.roomName(payload.recipeId);
    await client.leave(room);
    this.clientPresence.delete(client.id);
    this.server.to(room).emit('presence', {
      ...payload,
      status: 'left',
    } satisfies PresencePayload);
  }

  @SubscribeMessage('recipeChange')
  recipeChange(@ConnectedSocket() client: Socket, @MessageBody() payload: RecipeChangePayload): void {
    client.to(this.roomName(payload.recipeId)).emit('recipeChange', payload);
  }

  @SubscribeMessage('cursorMove')
  cursorMove(@ConnectedSocket() client: Socket, @MessageBody() payload: CursorPayload): void {
    client.to(this.roomName(payload.recipeId)).emit('cursorMove', payload);
  }

  private roomName(recipeId: number): string {
    return `recipe:${recipeId}`;
  }
}
